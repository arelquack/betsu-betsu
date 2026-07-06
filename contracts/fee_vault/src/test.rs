#![cfg(test)]

use super::*;
use soroban_sdk::Env;

#[test]
fn test_fee_vault() {
    let env = Env::default();
    let contract_id = env.register_contract(None, FeeVault);
    let client = FeeVaultClient::new(&env, &contract_id);

    assert_eq!(client.get_total_fees(), 0);

    client.deposit_fee(&1000);
    assert_eq!(client.get_total_fees(), 1000);

    client.deposit_fee(&500);
    assert_eq!(client.get_total_fees(), 1500);
}
