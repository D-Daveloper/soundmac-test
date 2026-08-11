type Listener = () => void;

let isOpen = false;
const listeners = new Set<Listener>();

export const subscriptionModalStore = {
  show: () => {
    isOpen = true;
    listeners.forEach((l) => l());
  },
  hide: () => {
    isOpen = false;
    listeners.forEach((l) => l());
  },
  getIsOpen: () => isOpen,
  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => { listeners.delete(listener)};
  },
};