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
import toast from 'react-hot-toast';

import { useCurrentUser } from '../lib/customHooks';
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'


interface FormErrors {
  full_name?: {
    message: string;
  };
  email?: {
    message: string;
  };
  number?: {
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
  const currentUser = useCurrentUser()
  const defaultCountry = currentUser.location.country //used by phone input
  const [saveError, setSaveError] = useState('');
  const [formData, setFormData] = useState<Customer>({
    full_name: '',
    email: '',
    number: '',
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
    function handleInputChange(){
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
      
      if (id) {
        setLoading(true);
        try {
          const customerData = await getCustomer(id) as Customer;
          setFormData(customerData); 
          setLoading(false);         
        } catch (error) {
          console.error("Error fetching customer data:", error);
          setLoadingError(true);
          setLoading(false);
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
  //needed a customer handler for phone number
  const handlePhoneInputChange = (value:string) => {
    setFormData({
      ...formData,
      number: value
    })    
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
    if (formData.full_name && formData.full_name.length < 3) {
      newErrors.full_name = { message: 'Name should be at least three characters' };
    }
    // Add more validation for other fields if needed
      
    if (Object.keys(newErrors).length >  0) {
      setErrors(newErrors);
      console.error('Form failed validation:', newErrors);
    } else {
      try {
        console.log(formData)
        await upsertCustomer(formData as Customer);
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
                name="full_name"
                id="full_name"
                value = {formData.full_name}
                onChange={handleChange}
                className={StyleTextfield}
                type="text"
                required
              />
              {errors.full_name?.message && <p>{errors.full_name.message as string}</p>} 
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
                id="email"
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
              htmlFor="number"
            >
              Phone number
            </label>
            <div className="relative">
              <PhoneInput
                value={formData.number}
                onChange={handlePhoneInputChange}
                name="number"
                defaultCountry={defaultCountry}
                className={StyleTextfield}
                id="number"
              />
              {errors.number?.message && <FormErrorMessage message={errors.number.message as string} />} 
            </div>
          </div>
          <div className="mt-4">
            <label
              className={StyleLabel}
              htmlFor="company"
            >
              Company
            </label>
            <div className="relative">
              <CompanySelect 
                  name="company" 
                  id="company"
                  value={formData.company} 
                  changeHandler={handleChange} 
                  error={errors.company ? true : false}
                  required={true}
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
                id="position"
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
                className="cursor-pointer bg-primary disabled:bg-slate-200 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none"
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
