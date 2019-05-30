import { Store } from 'redux';

declare module 'react-redux' {
  export function useStore(): Store;
}
