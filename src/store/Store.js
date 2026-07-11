// src/store/Store.js
import { configureStore } from '@reduxjs/toolkit';
import CustomizerReducer from './customizer/CustomizerSlice';

export const store = configureStore({
  reducer: {
    customizer: CustomizerReducer,
  },
  devTools: import.meta.env.DEV,
});

export default store;