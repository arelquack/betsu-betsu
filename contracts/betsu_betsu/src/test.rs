#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::{Address as _, MockAuth, MockAuthInvoke}, Env, IntoVal};

// We define a dummy fee vault contract for testing inter-contract calls
#[contract]
pub struct DummyFeeVault;

#[contractimpl]
impl DummyFeeVault {
    pub fn deposit_fee(env: Env, contract_id: Address, amount: i128) {
        contract_id.require_auth();
        let key = symbol_short!("fees");
        let mut total: i128 = env.storage().instance().get(&key).unwrap_or(0);
        total += amount;
        env.storage().instance().set(&key, &total);
    }

    pub fn get_total_fees(env: Env) -> i128 {
        let key = symbol_short!("fees");
        env.storage().instance().get(&key).unwrap_or(0)
    }
}

#[test]
fn test_record_split_increases_volume() {
    let env = Env::default();
    env.mock_all_auths();

    let vault_id = env.register_contract(None, DummyFeeVault);
    let betsu_id = env.register_contract(None, SplitTracker);
    
    let betsu_client = SplitTrackerClient::new(&env, &betsu_id);

    let payer = Address::generate(&env);
    let host = Address::generate(&env);

    assert_eq!(betsu_client.get_total_volume(), 0);

    betsu_client.record_split(&payer, &host, &vault_id, &1000);

    assert_eq!(betsu_client.get_total_volume(), 1000);
}

#[test]
fn test_inter_contract_fee_logging() {
    let env = Env::default();
    env.mock_all_auths();

    let vault_id = env.register_contract(None, DummyFeeVault);
    let betsu_id = env.register_contract(None, SplitTracker);
    
    let betsu_client = SplitTrackerClient::new(&env, &betsu_id);
    let vault_client = DummyFeeVaultClient::new(&env, &vault_id);

    let payer = Address::generate(&env);
    let host = Address::generate(&env);

    assert_eq!(vault_client.get_total_fees(), 0);

    // Record a split of 2000
    betsu_client.record_split(&payer, &host, &vault_id, &2000);

    // Fee is 1% of 2000 = 20
    assert_eq!(vault_client.get_total_fees(), 20);
}

#[test]
#[should_panic]
fn test_auth_enforcement() {
    let env = Env::default();
    // Do NOT mock all auths here to ensure we get an auth panic when require_auth fails

    let vault_id = env.register_contract(None, DummyFeeVault);
    let betsu_id = env.register_contract(None, SplitTracker);
    
    let betsu_client = SplitTrackerClient::new(&env, &betsu_id);

    let payer = Address::generate(&env);
    let host = Address::generate(&env);

    // This should panic because payer's auth is required but not provided in mock
    betsu_client.record_split(&payer, &host, &vault_id, &1000);
}
