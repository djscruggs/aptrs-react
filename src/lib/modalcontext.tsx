import React, { createContext, useState } from 'react';

interface ModalProviderProps {
  show: boolean;
  children: React.ReactNode;
}

interface ModalContextProps {
  show: boolean;
  toggleModal: () => void;
  setShow: (value: boolean) => void;
}

export const ModalContext = createContext<ModalContextProps>({
  show: false,
  toggleModal: () => {},
  setShow: () => {},
});

export const ModalProvider: React.FC<ModalProviderProps> = ({
  show: initialShow,
  children,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(initialShow);

  const toggleModal = () => {
    console.log('called in ModalContext, current state is')
    setIsModalOpen((prevState) => !prevState);
  };

  const setShow = (value: boolean) => {
    setIsModalOpen(value);
  };

  const modalContextValue: ModalContextProps = {
    show: isModalOpen,
    toggleModal,
    setShow,
  };
  console.log('context, modal open is ', modalContextValue)
  return (
    <ModalContext.Provider value={modalContextValue}>
      {children}
    </ModalContext.Provider>
  );
};
