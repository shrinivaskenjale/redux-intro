import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  balance: 0,
  loan: 0,
  loanPurpose: "",
  isLoading: false,
};

export const accountSlice = createSlice({
  name: "account",
  initialState,
  // In RTK, we have a reducer function per action type.
  reducers: {
    deposit: (state, action) => {
      state.balance = state.balance + action.payload;
      state.isLoading = false;
    },
    withdraw: (state, action) => {
      state.balance = state.balance - action.payload;
    },
    requestLoan: {
      reducer: (state, action) => {
        if (state.loan > 0) return;
        state.loan = action.payload.amount;
        state.loanPurpose = action.payload.purpose;
        state.balance = state.balance + action.payload.amount;
      },
      prepare: (amount, purpose) => {
        return { payload: { amount, purpose } };
      },
    },
    payLoan: (state, action) => {
      state.balance = state.balance - state.loan;
      state.loan = 0;
      state.loanPurpose = "";
    },
    convertingCurrency: (state) => {
      state.isLoading = true;
    },
  },
});

// Action creators are generated for each case reducer function
export const { withdraw, requestLoan, payLoan } = accountSlice.actions;

// Our own action creator
export function deposit(amount, currency) {
  if (currency === "USD") {
    return {
      type: "account/deposit",
      payload: amount,
    };
  }
  return async (dispatch, getState) => {
    dispatch({ type: "account/convertingCurrency" });
    const host = "api.frankfurter.app";
    const res = await fetch(
      `https://${host}/latest?amount=${amount}&from=${currency}&to=USD`
    );
    const data = await res.json();
    const convertedAmount = data.rates.USD;
    dispatch({
      type: "account/deposit",
      payload: convertedAmount,
    });
  };
}

export default accountSlice.reducer;
