import PageTitle from "../components/page-title";
import ShowPasswordButton from '../components/show-password-button';

import { updateProfile, changePassword} from '../lib/data/api';
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
import { phoneRegex, emailRegex, parseErrors } from '../lib/utilities';
import { withAuth } from "../lib/authutils";
import { 
  useState, 
  ChangeEvent, 
  FormEvent
} from 'react';


interface FormErrors {
  email?: string
  full_name?: string
  position?: string
  number?: string
  newpassword?: string
  newpassword_check?: string
}
type UserForm = User & {
  newpassword?: string;
  newpassword_check?: string;
};
export const Profile = () => {
  const [currentUser, setCurrentUser] = useState(useCurrentUser())
  const [btnDisabled, setBtnDisabled] = useState(false)
  const [saveError, setSaveError] = useState('');
  const [editing, setEditing] = useState(false)
  const [file, setFile] = useState()
  const defaults = {
    id: currentUser.id,
    full_name: currentUser.full_name,
    email: currentUser.email,
    number: currentUser.number,
    position: currentUser.position,
    groups: currentUser.groups,
    oldpassword: '',
    newpassword: '',
    newpassword_check: '',
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
  const handleProfilepic = (event: ChangeEvent<HTMLInputElement>): void => {
    setFile(event.target.files[0])
    console.log(event.target.files[0])
  }
  const [passwordVisible, setPasswordVisible] = useState(false)
  function togglePasswordVisibility() {
    setPasswordVisible((prevState) => !prevState);
  }
  
  const handlePhoneInputChange = (value:string) => {
    setFormData({
      ...formData,
      number:value
    })    
  };

  const validatePassword = ():boolean => {
    return (validatePasswordLength( ) && validatePasswordCaps() && validatePasswordSpecial())
  }
  const validatePasswordLength = ():boolean => {
    return formData?.newpassword.length > 9;
  }
  const validatePasswordCaps = ():boolean => {
    return /[A-Z]/.test(formData?.newpassword);
  }
  const validatePasswordSpecial = ():boolean => {
    return /[@#$%!^&*]/.test(formData?.newpassword);
  }
  
  const handleSubmit  = async (event: FormEvent<HTMLFormElement>) => {
    setSaveError('')
    setBtnDisabled(true);
    setErrors({})
    event.preventDefault();
    
    // FORM VALIDATION
    const newErrors: FormErrors = {};
    if (!emailRegex.test(String(formData?.email))) {
      newErrors.email = 'Enter a valid email address';
    }
    // const phoneRegex = /^(\+[1-9]\d{0,2}-)?\d{1,14}$/;
    if(formData?.number){
      if (!phoneRegex.test(String(formData?.number))) {
        newErrors.number = 'Enter a valid phone number';
      }
    }
    
    //"This password is too common.",
    // "The password must contain at least 1 uppercase letter, A-Z."
    // ,"The password must contain at least 1 special character: @#$%!^&*",
    // "This password must contain at least 10 characters."]}
    if(formData.newpassword != formData.newpassword_check){
      newErrors.newpassword_check = 'Passwords do not match';
    }
    if(formData.newpassword && !validatePassword()){
      newErrors.newpassword = 'Invalid password';
    }
    if (Object.keys(newErrors).length >  0) {
      setErrors(newErrors);
      console.error('Form failed validation:', newErrors);
      setBtnDisabled(false);
      return null
    }
    try {
      await updateProfile(formData, file);
      setCurrentUser(useCurrentUser());
      toast.success('Profile saved.')
    } catch (error) {
      console.error('Error submitting form:', error);
      setSaveError(String(error))
    }
    if(formData.newpassword && formData.newpassword_check){
      try {
      await changePassword(formData as User);
      toast.success('Password updated')
      } catch (error) {
        console.error('Error submitting form:', error);
        //try to parse out the error
        try {
          setErrors(parseErrors(error))
          
          if(errors.non_field_errors.length > 0){
            setSaveError(errors.non_field_errors[0])
          } else {
            setSaveError(String(error))
          }
          
        } catch (error){
          setSaveError(String(error))
        }
        
      }
    }
    setBtnDisabled(false);
  }
  const toggleEditing = () => {
    setEditing(!editing)
    setErrors({})
    setFormData(defaults)
    if(!editing) {
      setPasswordVisible(false)
    }
  }
  return (
    <>
    <PageTitle title='Profile Page' />
    {saveError && <FormErrorMessage message={saveError} />}
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

            {errors.full_name && <FormErrorMessage message={errors.full_name} />}
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
            {errors.email && <FormErrorMessage message={errors.email} />}
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
            {errors.number && <FormErrorMessage message={errors.number} />}
          </div>
        </div>
        
        {editing && 
          <div className="max-w-sm mb-4">
            <label 
              htmlFor="profilepic"
              className={StyleLabel}>
              Upload photo
            </label>
            <input 
              id="profilepic" 
              name="profilepic"
              type="file"
              onChange={handleProfilepic}
              className="text-xs"
              >

            </input>
          </div>
        }
        {editing &&
          <fieldset className="max-w-sm form-control rounded-md  space-y-2 p-2 border border-slate-200" >
            <legend className='text-sm'>Change Password (optional)</legend>
            <div className="w-full mt-0">
            <label 
                htmlFor="oldpassword"
                className='mt-0 mb-2 block text-xs font-medium text-gray-900'
              >
                Current Password
              </label>
              <div className="relative">
                <input
                  name="oldpassword"
                  id="oldpassword"
                  className={`${StyleTextfield} mb-4`}
                  onChange={handleChange}
                  type={passwordVisible ? "text" : "password"}
                  
                />
                <ShowPasswordButton passwordVisible={passwordVisible} clickHandler={togglePasswordVisibility} />
              </div>
              <div className={formData.newpassword && !validatePassword() ? 'text-red-500 text-xs' : 'text-xs'}>
              The new password must contain: 
              <ul className={`list-disc  pl-4 mb-4 ${formData.newpassword && validatePassword() ? 'text-green-400' : ''}`}>
                <li className={formData.newpassword && validatePasswordLength() ? 'text-green-400' : ''}>at least 10 characters</li>
                <li className={formData.newpassword && validatePasswordCaps() ? 'text-green-400' : ''}>at least 1 uppercase letter</li>
                <li className={formData.newpassword && validatePasswordSpecial() ? 'text-green-400' : ''}>at least 1 special character (e.g. @#$%!^&*)</li>
              </ul>
              </div>
              <label 
                htmlFor="newpassword"
                className='mt-0 mb-2 block text-xs font-medium text-gray-900'
              >
                New Password
              </label>
             
              
              <div className="relative">
                <input
                  name="newpassword"
                  id="newpassword"
                  className={formData.newpassword && !validatePassword() ? `${StyleTextfieldError}  mb-2` :`${StyleTextfield}  mb-2`}
                  onChange={handleChange}
                  type={passwordVisible ? "text" : "password"}
                  
                />
                <ShowPasswordButton passwordVisible={passwordVisible} clickHandler={togglePasswordVisibility} />
              </div>
              
              
              
            </div>
            <div className="w-full mt-0">
              <label 
                htmlFor="newpassword_check"
                className='mt-0 mb-2 block text-xs font-medium text-gray-900'
              >
                Repeat new password
              </label>
              <div className="relative">
                <input
                  name="newpassword_check"
                  id="newpassword_check"
                  className={formData.newpassword != formData.newpassword_check ? `${StyleTextfieldError}` :`${StyleTextfield}`}
                  onChange={handleChange}
                  type={passwordVisible ? "text" : "password"}                    
                />
                <ShowPasswordButton passwordVisible={passwordVisible} clickHandler={togglePasswordVisibility} />
                  
              </div>
              {formData.newpassword != formData.newpassword_check && <p className='text-xs mt-2 ml-1 text-red-500'>Passwords should match</p>}
            </div>
          </fieldset>
        }
        
          <div className="p-2 flex mt-4">
            <div className="w-1/2 flex justify-left">
              {!editing &&
                <Button 
                  className="bg-primary -ml-3"
                  onClick={() => toggleEditing()}
                  disabled={btnDisabled}>
                  Edit
                </Button>
              }
              {editing &&
                <>
                  <Button 
                  className="bg-primary disabled:bg-gray-200 disabled:border-gray-200 disabled:shadow-none"
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
                </>
              }
            </div>
          </div>
        
        
      </form>
    </>
    
  )
};

export default withAuth(Profile);