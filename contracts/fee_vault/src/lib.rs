#![no_std]
use soroban_sdk::{contract, contractimpl, Env, Symbol, symbol_short};

#[contract]
pub struct FeeVault;

#[contractimpl]
impl FeeVault {
    /// Deposits a fee into the vault.
    /// In a real world scenario, this would transfer tokens.
    /// Here we just track the total accumulated fees for the caller contract.
    pub fn deposit_fee(env: Env, contract_id: soroban_sdk::Address, amount: i128) {
        contract_id.require_auth();
        let key = symbol_short!("fees");
        let mut total: i128 = env.storage().instance().get(&key).unwrap_or(0);
        total += amount;
        env.storage().instance().set(&key, &total);
        
        env.events().publish((symbol_short!("fee_dep"),), amount);
    }

    /// Returns the total fees accumulated.
    pub fn get_total_fees(env: Env) -> i128 {
        let key = symbol_short!("fees");
        env.storage().instance().get(&key).unwrap_or(0)
    }
}

#[cfg(test)]
mod test;
