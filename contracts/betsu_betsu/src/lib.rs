#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, Symbol, symbol_short};

#[contract]
pub struct SplitTracker;

#[contractimpl]
impl SplitTracker {
    /// Records a split bill payment and emits an event.
    /// Also tracks the total volume of splits.
    pub fn record_split(env: Env, payer: Address, host: Address, fee_vault_address: Address, amount: i128) {
        payer.require_auth();

        // Increment the total split volume
        let key = symbol_short!("total");
        let mut total: i128 = env.storage().instance().get(&key).unwrap_or(0);
        total += amount;
        env.storage().instance().set(&key, &total);

        // Calculate 1% fee
        let fee = amount / 100;
        
        // Inter-contract communication: call deposit_fee on fee_vault
        use soroban_sdk::{vec, IntoVal};
        let current_addr = env.current_contract_address();
        env.invoke_contract::<()>(
            &fee_vault_address,
            &Symbol::new(&env, "deposit_fee"),
            vec![&env, current_addr.into_val(&env), fee.into_val(&env)],
        );

        // Emit an event for the frontend to listen to
        env.events().publish((symbol_short!("split"), payer, host), amount);
    }

    /// Returns the total volume of all splits recorded.
    pub fn get_total_volume(env: Env) -> i128 {
        let key = symbol_short!("total");
        env.storage().instance().get(&key).unwrap_or(0)
    }
}

#[cfg(test)]
mod test;
