import { useState, useEffect } from 'react';
import { Modal, Button } from 'react-daisyui';
import CompanyForm from './company-form'; // Your form content component

function CompanyModal() { 
  const [modalOpen, setModalOpen] = useState(false);
  const [idForForm, setIdForForm] = useState<string | null>(null);

  const openModal = (id: string) => {
    setIdForForm(id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setIdForForm(null);
    setModalOpen(false);
  };

  return (
    <>
      {/* <Button onClick={() => openModal('your_id_here')}>Open Modal</Button>
      <Modal open={modalOpen} onClose={closeModal}>
        {idForForm && <CompanyForm id={idForForm} closeModal={closeModal} />}
      </Modal> */}
    </>
  );
}

export default CompanyModal;