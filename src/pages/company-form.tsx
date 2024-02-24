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
import { WithAuth } from "../lib/authutils";
import Button from '../components/button';
import { FormSkeleton } from '../components/skeletons'
import { getCompany } from '../lib/data/api';
import { upsertCompany} from '../lib/data/api';
import { Company } from '../lib/data/definitions'
import toast from 'react-hot-toast';
interface FormErrors {
  name?: string
  address?: string
  img?: string
}

interface CompanyFormProps {
  id?: string; // Make the ID parameter optional
  forwardedRef?: RefObject<HTMLDialogElement> //handle to the modal this is loaded in
  setRefresh?: React.Dispatch<React.SetStateAction<boolean>> //state function to tell parent to reload data
  onClose: () => void;
}
function CompanyForm({ id: companyId, forwardedRef, setRefresh, onClose }: CompanyFormProps): JSX.Element {
  const [id, setId] = useState(companyId)
  const [btnDisabled, setBtnDisabled] = useState(false)
  const [loading, setLoading] = useState(false);
  const [loadingError, setLoadingError] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [formData, setFormData] = useState<Company>({
    name: '',
    address: '',
    // img: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  
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
    const loadData = async () => {
      if (id) {
        setLoading(true);
        try {
          const companyData = await getCompany(id) as Company;
          
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
      newErrors.name = 'Name should be at least three characters';
    }
    if (Object.keys(newErrors).length >  0) {
      setErrors(newErrors);
      console.error('Form failed validation:', newErrors);
    } else {
      try {
        await upsertCompany(formData as Company);
        toast.success('Company saved.')
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
              id="name"
              className={StyleTextfield}
              value={formData.name}
              onChange={handleChange}
              type="text"
              required
            />
            {errors.name && <FormErrorMessage message={errors.name} />}
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
              id="address"
              className={StyleTextfield}
              value={formData.address}
              onChange={handleChange}
              type="text"
              required
            />
            {errors.address && <FormErrorMessage message={errors.address} />}
          </div>
        </div>
        <div className="w-full mb-4">
          <label 
              className={StyleLabel}
              htmlFor="img">
              Image
          </label>
          {/* <div className="relative">
            <input
              name="img"
              id="img"
              className={StyleTextfield}
              value={formData.img}
              onChange={handleChange}
              type="text"
            />
            {errors.img && <FormErrorMessage message={errors.img} />}
          </div> */}
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
              <Button 
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

export default WithAuth(CompanyForm);
