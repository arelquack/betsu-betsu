#![cfg(test)]

use super::*;
use soroban_sdk::{Env, testutils::Address as _};

#[test]
fn test_fee_vault() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register_contract(None, FeeVault);
    let client = FeeVaultClient::new(&env, &contract_id);

    let caller = soroban_sdk::Address::generate(&env);

    assert_eq!(client.get_total_fees(), 0);

    client.deposit_fee(&caller, &1000);
    assert_eq!(client.get_total_fees(), 1000);

    client.deposit_fee(&caller, &500);
    assert_eq!(client.get_total_fees(), 1500);
}
