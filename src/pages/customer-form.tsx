import React, { 
  useState, 
  useEffect,
  ChangeEvent, 
  FormEvent,
  RefObject
} from 'react';
import {
  StyleTextfield,
  StyleLabel,
  FormErrorMessage,
  ModalErrorMessage
} from '../lib/formstyles'
import Button from '../components/button';
import CompanySelect from '../components/company-select';
import { FormSkeleton } from '../components/skeletons'
import { getCustomer } from '../lib/data/api';
import { upsertCustomer} from '../lib/data/api';
import { Customer } from '../lib/data/definitions'
import { Company } from '../lib/data/definitions'
import toast from 'react-hot-toast';

interface FormErrors {
  name?: {
    message: string;
  };
  email?: {
    message: string;
  };
  phoneNumber?: {
    message: string;
  };
  position?: {
    message: string;
  };
  company?: {
    message: string;
  };
}

interface CustomerFormProps {
  id?: string; // Make the ID parameter optional
  forwardedRef?: RefObject<HTMLDialogElement> //handle to the modal this is loaded in
  setRefresh?: React.Dispatch<React.SetStateAction<boolean>> //state function to tell parent to reload data
  onClose: () => void;
}
function CustomerForm({ id: customerId, forwardedRef, setRefresh, onClose }: CustomerFormProps): JSX.Element {
  const [id, setId] = useState(customerId)
  const [btnDisabled, setBtnDisabled] = useState(false)
  const [loading, setLoading] = useState(false);
  const [loadingError, setLoadingError] = useState(false);
  
  const [saveError, setSaveError] = useState('');
  const [formData, setFormData] = useState<Customer>({
    name: '',
    email: '',
    phoneNumber: '',
    position: '',
    company: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  
  
  //listen for the escape key, give user option of overriding if their editing
  useEffect(() => {
    let editing: Boolean; //flag to track whether the form has been edited
    function handleKeyDown(e: KeyboardEvent) {
      if(e.key == 'Escape') {
        e.preventDefault()
        if(editing){
          if(!confirm('Quit without saving?')){
            return null;
          }
        } 
        closeModal()
      //if it's an input element, set editing to true
      } else if(e.target?.toString().includes('HTMLInput')) {
        editing = true;
      }
    }
    //set flag to true if an input eleent
    function handleInputChange(e: Event){
      editing = true;
    }
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("change", handleInputChange);

    return function cleanup() {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("change", handleInputChange);
    };
  }, []);

  useEffect(() => {
    const loadCustomer = async () => {
      setLoading(true);
      if (id) {
        try {
          const customerData = await getCustomer(id) as Customer;
          setFormData(customerData); 
          setLoading(false);         
        } catch (error) {
          console.error("Error fetching customer data:", error);
          setLoadingError(true);
          // Handle error fetching data
        } 
      }
    };
    loadCustomer();
  }, [id]);
  

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };
  //clean up the data to make sure the next instance is clean
  const closeModal = () =>  {
    setId('')
    if(forwardedRef?.current ) {
      forwardedRef.current.close()
    }
    onClose()
  }
  const handleSubmit = async(event: FormEvent<HTMLFormElement>) => {
    setBtnDisabled(true);
    event.preventDefault();
    // Perform your form validation here
    const newErrors: FormErrors = {};
    // Example validation logic (replace with your own)
    if (formData.name && formData.name.length < 3) {
      newErrors.name = { message: 'Name should be at least three characters' };
    }
    // Add more validation for other fields if needed
      
    if (Object.keys(newErrors).length >  0) {
      setErrors(newErrors);
      console.error('Form failed validation:', newErrors);
    } else {
      try {
        const response = await upsertCustomer(formData as Customer);
        toast.success('Customer saved.')
        if(setRefresh){
          setRefresh(true)
        }
        closeModal()
        // Handle success (e.g., show success message, redirect, etc.)
      } catch (error) {
        console.error('Error submitting form:', error);
        setSaveError(String(error))
        // Handle error (e.g., show error message)
      }
    }
    setBtnDisabled(false);
    
  }
  if(loading) return <FormSkeleton numInputs={5}/>
  if (loadingError) return <ModalErrorMessage message={"Error loading customer"} />


  return (
    <div className="max-w-lg flex-1 rounded-lg">
      <h1 className="mb-3 text-2xl">
        {id ? "Edit" : "Create"} Customer
      </h1>
      {saveError && <FormErrorMessage message={saveError} />}
      <form onSubmit={handleSubmit} id="customerForm" method="POST">
        {/* Form inputs */}
        <div className="w-full mb-4">
          <div>
            <label
              className={StyleLabel}
              htmlFor="name"
            >
              Name
            </label>
            <div className="relative">
              <input
                name="name"
                value = {formData.name}
                onChange={handleChange}
                className={StyleTextfield}
                type="text"
                required
              />
              {errors.name?.message && <p>{errors.name.message as string}</p>} 
            </div>
          </div>
          <div className="mt-4">
            <label
              className={StyleLabel}
              htmlFor="email"
            >
              Email
            </label>
            <div className="relative">
              <input
                name="email"
                value = {formData.email}
                className={StyleTextfield}
                onChange={handleChange}
                type="text"
                required
              />
              {errors.email?.message && <p>{errors.email.message as string}</p>} 
            </div>
          </div>
          <div className="mt-4">
            <label
              className={StyleLabel}
              htmlFor="phoneNumber"
            >
              Phone number
            </label>
            <div className="relative">
              <input
                name="phoneNumber"
                value = {formData.phoneNumber}
                onChange={handleChange}
                className={StyleTextfield}
                type="text"
                required
              />
              {errors.phoneNumber?.message && <FormErrorMessage message={errors.phoneNumber.message as string} />} 
            </div>
          </div>
          <div className="mt-4">
            <label
              className={StyleLabel}
              htmlFor="companyname"
            >
              Company
            </label>
            <div className="relative">
              <CompanySelect 
                  name="companyname" 
                  value={formData.company} 
                  changeHandler={handleChange} 
                  error={errors.company ? true : false}
                />
              {errors.company?.message && <FormErrorMessage message={errors.company.message as string} />} 
            </div>
          </div>
          <div className="mt-4">
            <label
              className={StyleLabel}
              htmlFor="position"
            >
              Position
            </label>
            <div className="relative">
              <input
                name="position"
                value = {formData.position}
                onChange={handleChange}
                className={StyleTextfield}
                type="text"
                required
              />
              {errors.position?.message && <FormErrorMessage message={errors.position.message as string} />} 
            </div>
          </div>
          
        </div>
        <div className="p-2 flex">
          <div className="w-1/2 flex justify-left">
                <Button 
                className="bg-primary disabled:bg-slate-200 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none"
                disabled={btnDisabled}
                type="submit">
                  Save
              </Button>
              <Button 
                type="button"
                className="bg-red-500 ml-1"
                onClick = {closeModal}
                disabled={btnDisabled}>
                  Cancel
              </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CustomerForm;
