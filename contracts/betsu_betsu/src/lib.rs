#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, Symbol, symbol_short};

#[contract]
pub struct SplitTracker;

#[contractimpl]
impl SplitTracker {
    /// Records a split bill payment and emits an event.
    /// Also tracks the total volume of splits.
    pub fn record_split(env: Env, payer: Address, host: Address, amount: i128) {
        payer.require_auth();

        // Increment the total split volume
        let key = symbol_short!("total");
        let mut total: i128 = env.storage().instance().get(&key).unwrap_or(0);
        total += amount;
        env.storage().instance().set(&key, &total);

        // Emit an event for the frontend to listen to
        env.events().publish((symbol_short!("split"), payer, host), amount);
    }

    /// Returns the total volume of all splits recorded.
    pub fn get_total_volume(env: Env) -> i128 {
        let key = symbol_short!("total");
        env.storage().instance().get(&key).unwrap_or(0)
    }
}
