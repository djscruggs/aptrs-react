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
import { fetchCompany } from '../lib/data/api';
import { upsertCompany} from '../lib/data/api';
import { Company } from '../lib/data/definitions'
interface FormErrors {
  name?: {
    message: string;
  };
  address?: {
    message: string;
  };
  img?: {
    message: string;
  };
}
interface CompanyFormProps {
  id?: string; // Make the ID parameter optional
  isModal?: boolean
}
function CompanyForm({ id: externalId, isModal: isModal }: CompanyFormProps): JSX.Element {
  const params = useParams()
  const { id: routeId } = params;
  const id = externalId || routeId; // Use externalId if provided, otherwise use routeId
  const [btnDisabled, setBtnDisabled] = useState(false)
  const [loading, setLoading] = useState(false);
  const [loadingError, setLoadingError] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [formData, setFormData] = useState<Company>({
    name: '',
    address: '',
    img: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const loadData = async () => {
      if (id) {
        setLoading(true);
        try {
          const companyData = await fetchCompany(id) as Company;
          setFormData(companyData);
        } catch (error) {
          console.error("Error fetching company data:", error);
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
    console.log(event)
    // Perform your form validation here
    const newErrors: FormErrors = {};
    // Example validation logic (replace with your own)
    if (formData.name && formData.name.length < 3) {
      newErrors.name = { message: 'Name should be at least three characters' };
    }
    // Add more validation for other fields if needed
      
    console.log('Form submitted:', formData);
    if (Object.keys(newErrors).length >  0) {
      setErrors(newErrors);
      console.log('Form failed validation:', newErrors);
    } else {
      try {
        const response = await upsertCompany(formData as Company);
        console.log('Form submitted successfully:', response);
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
  if (loadingError) return <ModalErrorMessage message={"Error loading company"} />


  return (
    <div className="max-w-lg flex-1 rounded-lg">
      
      <h1 className="mb-3 text-2xl">
        {id ? "Edit" : "Create"} Company
      </h1>
      {saveError && <FormErrorMessage message={saveError} />}
      <form onSubmit={handleSubmit} id="projectForm" method="POST">
        {/* Form inputs */}
        <div className="w-full mb-4">
          <label 
            htmlFor="name"
            className={StyleLabel}>
            Company Name
          </label>
          <div className="relative">
            <input
              name="name"
              className={StyleTextfield}
              value={formData.name}
              onChange={handleChange}
              type="text"
              required
            />
            {errors.name?.message && <FormErrorMessage message={errors.name.message} />}
          </div>
        </div>
        <div className="w-full mb-4">
          <label 
            className={StyleLabel}
            htmlFor="address">
              Address
          </label>
          <div className="relative">
            <input
              name="address"
              className={StyleTextfield}
              value={formData.address}
              onChange={handleChange}
              type="text"
              required
            />
            {errors.address?.message && <FormErrorMessage message={errors.address.message} />}
          </div>
        </div>
        <div className="w-full mb-4">
          <label 
              className={StyleLabel}
              htmlFor="img">
              Image
          </label>
          <div className="relative">
            <input
              name="img"
              className={StyleTextfield}
              value={formData.img}
              onChange={handleChange}
              type="text"
            />
            {errors.img?.message && <FormErrorMessage message={errors.img.message} />}
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

export default withAuth(CompanyForm);
