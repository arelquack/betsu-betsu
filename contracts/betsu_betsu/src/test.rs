#![cfg(test)]

use super::*;
use soroban_sdk::{Env, testutils::Address as _};

// We define a dummy fee vault contract for testing inter-contract calls
#[contract]
pub struct DummyFeeVault;

#[contractimpl]
impl DummyFeeVault {
    pub fn deposit_fee(env: Env, amount: i128) {
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
fn test_record_split() {
    let env = Env::default();
    env.mock_all_auths();

    // Register contracts
    let vault_id = env.register_contract(None, DummyFeeVault);
    let betsu_id = env.register_contract(None, SplitTracker);
    
    let betsu_client = SplitTrackerClient::new(&env, &betsu_id);
    let vault_client = DummyFeeVaultClient::new(&env, &vault_id);

    let payer = Address::generate(&env);
    let host = Address::generate(&env);

    // Initial states
    assert_eq!(betsu_client.get_total_volume(), 0);
    assert_eq!(vault_client.get_total_fees(), 0);

    // Record a split of 1000
    betsu_client.record_split(&payer, &host, &vault_id, &1000);

    // Assert states changed
    assert_eq!(betsu_client.get_total_volume(), 1000);
    
    // Fee is 1% of 1000 = 10
    assert_eq!(vault_client.get_total_fees(), 10);
}
