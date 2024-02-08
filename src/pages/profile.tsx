import PageTitle from "../components/page-title";
import { FormSkeleton } from "../components/skeletons";
import ShowPasswordButton from '../components/show-password-button';
import { getUser } from '../lib/data/api';
import { upsertUser} from '../lib/data/api';
import { useCurrentUser } from '../lib/customHooks';
import { User } from '../lib/data/definitions'
import toast from 'react-hot-toast';
import Button from '../components/button';
import { formatPhoneNumber } from 'react-phone-number-input'
import {
  StyleTextfield,
  StyleTextfieldError,
  StyleLabel,
  FormErrorMessage,
} from '../lib/formstyles'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { phoneRegex, emailRegex, usernameRegex } from '../lib/utilities';
import { withAuth } from "../lib/authutils";
import React, { 
  useState, 
  useEffect,
  ChangeEvent, 
  FormEvent,
  RefObject
} from 'react';

type Error = {message: string};
interface FormErrors {
  username?: Error
  email?: Error
  full_name?: Error
  position?: Error
  number?: Error
  password?:Error
  password_check?:Error
}
type UserForm = User & {
  password?: string;
  password_check?: string;
};

export const Profile = () => {
  const [btnDisabled, setBtnDisabled] = useState(false)
  const currentUser = useCurrentUser()
  const [saveError, setSaveError] = useState('');
  const [editing, setEditing] = useState(true)
  const defaults = {
    username: currentUser.username,
    full_name: currentUser.full_name,
    email: currentUser.email,
    number: currentUser.number,
    position: currentUser.position,
    password: '',
    password_check: '',
  }
  const [formData, setFormData] = useState<UserForm>(defaults);
  
  
  const defaultCountry = currentUser.location.country 
  const [errors, setErrors] = useState<FormErrors>({});
  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = event.target;
    
    // Check the type of input - checkboxes don't have a value attribute
    const inputValue = type === 'checkbox' ? checked : value;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: inputValue,
    }));
  };
  const [passwordVisible, setPasswordVisible] = useState(false)
  const handlePhoneInputChange = (value:string) => {
    setFormData({
      ...formData,
      number:value
    })    
  };
  
  const handleSubmit  = async (event: FormEvent<HTMLFormElement>) => {
    setBtnDisabled(true);
    setErrors({})
    event.preventDefault();
    
    // FORM VALIDATION
    const newErrors: FormErrors = {};
    if (!emailRegex.test(String(formData?.email))) {
      newErrors.email = { message: 'Enter a valid email address' };
    }
    // const phoneRegex = /^(\+[1-9]\d{0,2}-)?\d{1,14}$/;
    if(formData?.number){
      if (!phoneRegex.test(String(formData?.number))) {
        newErrors.number = { message: 'Enter a valid phone number' };
      }
    }
    if (!usernameRegex.test(String(formData?.username))) {
      newErrors.email = { message: 'Username must be alphanumeric' };
    }
    if(formData.password != formData.password_check){
      newErrors.password_check = { message: 'Passwords do not match' };
    }
    if (Object.keys(newErrors).length >  0) {
      setErrors(newErrors);
      console.error('Form failed validation:', newErrors);
    } else {
      try {
        await upsertUser(formData as User);
        toast.success('User saved.')
        
        // Handle success (e.g., show success message, redirect, etc.)
      } catch (error) {
        console.error('Error submitting form:', error);
        setSaveError(String(error))
        // Handle error (e.g., show error message)
      }
    }
    setBtnDisabled(false);
  }
  const toggleEditing = () => {
    setEditing(!editing)
    setErrors({})
    setFormData(defaults)
  }
  return (
    <>
    <PageTitle title='Profile Page' />
    {saveError && <FormErrorMessage message={saveError} />}
    <p className='underline text-blue-500' onClick={toggleEditing}>
    {editing ? 'Cancel' : 'Edit'}
    </p>
    <form onSubmit={handleSubmit} id="projectForm" method="POST">
          <div className="max-w-sm mb-4">
            <label 
              htmlFor="full_name"
              className={StyleLabel}>
              Name
            </label>
            <div className="relative">
            {editing ?
              (<input
                name="full_name"
                id="full_name"
                className={StyleTextfield}
                value={formData.full_name}
                onChange={handleChange}
                type="text"
                required={true}
              />) : <>{currentUser.full_name}</>
            }

              {errors.full_name?.message && <FormErrorMessage message={errors.full_name.message} />}
            </div>
          </div>
       
          <div className="max-w-sm mb-4">
            <label 
              className={StyleLabel}
              htmlFor="email">
                Email
            </label>
            <div className="relative">
            {editing ?
              (<input
                name="email"
                id="email"
                className={StyleTextfield}
                value={formData.email}
                onChange={handleChange}
                type="text"
                required={true}
              />
              ) : <>{currentUser.email}</>
            }
              {errors.email?.message && <FormErrorMessage message={errors.email.message} />}
            </div>
          </div>
          <div className="max-w-sm mb-4">
            <label 
              className={StyleLabel}
              htmlFor="email">
                Username
            </label>
            <div className="relative">
            {editing ?
              (<input
                name="username"
                id="username"
                className={StyleTextfield}
                value={formData.username}
                onChange={handleChange}
                type="text"
                maxLength={20}
                required={true}
              />
              ) : <>{currentUser.username}</>
            }
              {errors.username?.message && <FormErrorMessage message={errors.username.message} />}
            </div>
          </div>
        
          <div className="max-w-sm mb-4">
          <label 
            htmlFor="name"
            className={StyleLabel}>
            Phone number
          </label>
          <div className="relative">
          {editing ?
              (<PhoneInput
              value={formData.number}
              onChange={handlePhoneInputChange}
              name="number"
              defaultCountry={defaultCountry}
              className={StyleTextfield}
              id="number"
              required={true}
            />) : <>{formatPhoneNumber(currentUser.number)}</>
          }
            {errors.number?.message && <FormErrorMessage message={errors.number.message} />}
          </div>
        </div>
        <div className="max-w-sm mb-4">
          <label 
            htmlFor="position"
            className={StyleLabel}>
            Position
          </label>
          
          <div className="relative">
          {editing ?
              (<input
              name="position"
              id="position"
              className={StyleTextfield}
              value={formData.position}
              onChange={handleChange}
              type="text"
              
            />) : <>{currentUser.position}</>
          }
          </div>
        </div>
        
        
        
        {editing &&
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
                onClick={() => toggleEditing()}
                disabled={btnDisabled}>
                  Cancel
              </Button>
          </div>
      </div>
      }
        
        
        
      </form>
    </>
  )
};

export default withAuth(Profile);