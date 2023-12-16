import React, { 
  useState, 
  useEffect,
  ChangeEvent, 
  FormEvent
} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  StyleTextfield,
  StyleLabel,
  FormErrorMessage,
  ModalErrorMessage
} from '../lib/formstyles'
import { withAuth } from "../lib/authutils";
import Button from '../components/button';
import { FormSkeleton } from '../components/skeletons'
import { fetchCustomer } from '../lib/data/api';
import { upsertCustomer} from '../lib/data/api';
import { Customer } from '../lib/data/definitions'

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
  isModal?: boolean
}
function CustomerForm({ id: externalId, isModal: isModal }: CustomerFormProps): JSX.Element {
  const params = useParams()
  const { id: routeId } = params;
  const id = externalId || routeId; // Use externalId if provided, otherwise use routeId
  const [btnDisabled, setBtnDisabled] = useState(false)
  const [loading, setLoading] = useState(false);
  const [loadingError, setLoadingError] = useState(false);
  const [hideSelf, setHideSelf] = useState(false)
  const [saveError, setSaveError] = useState('');
  const [formData, setFormData] = useState<Customer>({
    name: '',
    email: '',
    phoneNumber: '',
    position: '',
    company: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const loadData = async () => {
      if (id) {
        setLoading(true);
        try {
          const customerData = await fetchCustomer(id) as Customer;
          setFormData(customerData);
        } catch (error) {
          console.error("Error fetching customer data:", error);
          setLoadingError(true);
          // Handle error fetching data
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [id]);
  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };
  const navigate = useNavigate()
  const handleCancel = () =>  {
    navigate(-1)
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
      console.log('Form failed validation:', newErrors);
    } else {
      try {
        const response = await upsertCustomer(formData as Customer);
        
        // Handle success (e.g., show success message, redirect, etc.)
      } catch (error) {
        console.error('Error submitting form:', error);
        setSaveError(String(error))
        // Handle error (e.g., show error message)
      }
    }
    setBtnDisabled(false);
    
  }
  if(loading) return <FormSkeleton numInputs={3}/>
  if (loadingError) return <ModalErrorMessage message={"Error loading customer"} />


  return (
    <div className="max-w-lg flex-1 rounded-lg">
      
      <h1 className="mb-3 text-2xl">
        {id ? "Edit" : "Create"} Customer
      </h1>
      {saveError && <FormErrorMessage message={saveError} />}
      <form onSubmit={handleSubmit} id="projectForm" method="POST">
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
              htmlFor="company"
            >
              Company
            </label>
            <div className="relative">
              <input
                name="company"
                value = {formData.company}
                onChange={handleChange}
                className={StyleTextfield}
                type="text"
                required
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
        {/* Submit button */}
        
        <div className="p-2 flex">
          <div className="w-1/2 flex justify-left">
                <Button 
                className="bg-primary disabled:bg-slate-200 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none"
                disabled={btnDisabled}
                type="submit">
                  Save
              </Button>
              {!isModal &&
                <Button 
                  className="bg-red-500 ml-1"
                  onClick = {handleCancel}
                  disabled={btnDisabled}>
                    Cancel
                </Button>
              } 
          </div>
      </div>
        
        
        
      </form>
    </div>
  );
}

export default withAuth(CustomerForm);
