import { AnyAction } from 'redux';
import type { RootState, AppDispatch } from 'store';
import type { ThunkAction } from 'redux-thunk';

import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction
>;

export default useAppDispatch;
