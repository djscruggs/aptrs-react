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

import PageTitle from '../components/page-title';
import CompanySelect from '../components/company-select';
import { withAuth } from "../lib/authutils";
import Button from '../components/button';
import { FormSkeleton, SingleInputSkeleton } from '../components/skeletons'
import { 
    AuthUser, 
    getProject, 
    fetchUsers } from '../lib/data/api';
import { upsertProject} from '../lib/data/api';
import { Project, User } from '../lib/data/definitions'
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface FormErrors {
  name?: {
    message: string;
  };
  description?: {
    message: string;
  };
  status?: {
    message: string;
  };
  projecttype?: {
    message: string;
  };
  startdate?: {
    message: string;
  };
  enddate?: {
    message: string;
  };
  testingtype?: {
    message: string;
  };
  projectexception?: {
    message: string;
  };
  companyname?: {
    message: string;
  };
  owner?: {
    message: string;
  };
}


interface ProjectFormProps {
  id?: string; // Make the ID parameter optional
  isModal?: boolean
}
console.log(AuthUser())
function ProjectForm({ id: externalId, isModal: isModal }: ProjectFormProps): JSX.Element {
  const params = useParams()
  const { id: routeId } = params;
  const id = externalId || routeId; // Use externalId if provided, otherwise use routeId
  const [btnDisabled, setBtnDisabled] = useState(false)
  const [loading, setLoading] = useState(false);
  const [loadingError, setLoadingError] = useState(false);
  
  const [saveError, setSaveError] = useState('');
  const [formData, setFormData] = useState<Project>({
    name: '',
    description: '',
    status: '',
    projecttype: '',
    startdate: '',
    enddate: '',
    testingtype: '',
    projectexception: '',
    companyname: '',
    owner: AuthUser().username,
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [users, setUsers] = useState<User[]>();

  useEffect(() => {
    const loadData = async () => {
      if (id) {
        setLoading(true);
        try {
          const projectData = await getProject(id) as Project;
          setFormData(projectData);
        } catch (error) {
          console.error("Error fetching project data:", error);
          setLoadingError(true);
          // Handle error fetching data
        } finally {
          setLoading(false);
        }
      }
      fetchUsers()
      .then((data) => {
        setUsers(data)
      }).catch((error) => {
        setSaveError(error)
      })
    };
    
    loadData();
  }, [id]);
  
  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };
  const handleDatePicker = (input: string, value:string): void => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [input]: value,
    }));
  }
  
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
        const response = await upsertProject(formData as Project);
        
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
  if (loadingError) return <ModalErrorMessage message={"Error loading project"} />

  return (
          <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
          {saveError && <FormErrorMessage message={saveError} />}
          <form action="" onSubmit={handleSubmit} id="projectForm" method="POST">
          <PageTitle title={id ? "Edit Project" : "Create Project"} />
      
          <div className='grid grid-cols-2'>
            <div className="w-full p-4 pl-0">
              
                <div className="mt-4">
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
                      className={StyleTextfield}
                      onChange={handleChange}
                      type="text"
                      required
                    />
                    {errors.name?.message && <p>{errors.name.message as string}</p>} 
                  </div>
                </div>
                <div className="mt-4">
                  <label
                    className={StyleLabel}
                    htmlFor="projecttype"
                  >
                    Type
                  </label>
                  <div className="relative">
                    <input
                      name="projecttype"
                      value = {formData.projecttype}
                      onChange={handleChange}
                      className={StyleTextfield}
                      type="text"
                      required
                    />
                    {errors.projecttype?.message && <p>{errors.projecttype.message as string}</p>} 
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
                      value={formData.companyname} 
                      changeHandler={handleChange} 
                      error={errors.companyname ? true : false}
                    />
                    
                    {errors.companyname?.message && <FormErrorMessage message={errors.companyname.message as string} />} 
                  </div>
                </div>
                <div className="mt-4 min-h-full">
                  <label
                    className={StyleLabel}
                    htmlFor="description"
                  >
                    Description
                  </label>
                  <div className="relative">
                    <CKEditor
                      data = {formData.description}
                      onReady={ editor => {
                            if (formData.description) editor.setData(formData.description)
                        }}
                      
                      editor={ClassicEditor}
                      
                    />
                      
                      {errors.description?.message && <FormErrorMessage message={errors.description.message as string} />} 
                  </div>
                </div>
              
            </div>
            <div className="w-full p-4">
              <div className='grid grid-cols-2'>
                <div className="mt-4">
                  <label
                    className={StyleLabel}
                    htmlFor="startdate"
                  >
                    Start Date
                  </label>
                  <div className="relative">
                      <DatePicker
                        placeholderText='Select date'
                        dateFormat="yyyy-MM-dd"
                        onChange={(date:string) => handleDatePicker('startdate', date)}
                        selected={formData.startdate ? new Date(formData.startdate) : ''}
                      />
                    {errors.startdate?.message && <FormErrorMessage message={errors.startdate.message as string} />} 
                  </div>
                </div>
                <div className="mt-4">
                  <label
                    className={StyleLabel}
                    htmlFor="enddate"
                  >
                    End Date
                  </label>
                  <div className="relative">
                    <DatePicker
                      placeholderText='Select date'
                      dateFormat="yyyy-MM-dd"
                      onChange={(date:string) => handleDatePicker('enddate', date)}
                      selected={formData.enddate ? new Date(formData.enddate) : ''}
                    />
                    {errors.enddate?.message && <FormErrorMessage message={errors.enddate.message as string} />} 
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label
                  className={StyleLabel}
                  htmlFor="testingtype"
                >
                  Testing Type
                </label>
                <div className="relative">
                  <input
                    name="testingtype"
                    value = {formData.testingtype}
                    onChange={handleChange}
                    className={StyleTextfield}
                    type="text"
                    required
                  />
                  {errors.testingtype?.message && <FormErrorMessage message={errors.testingtype.message as string} />} 
                </div>
              </div>
              <div className="mt-4">
                <label
                  className={StyleLabel}
                  htmlFor="projectexception"
                >
                  Project Exception
                </label>
                <div className="relative">
                  <input
                    name="projectexception"
                    value = {formData.projectexception}
                    onChange={handleChange}
                    className={StyleTextfield}
                    type="text"
                    required
                  />
                  {errors.projectexception?.message && <FormErrorMessage message={errors.projectexception.message as string} />} 
                </div>
              </div>
              
              <div className="mt-4">
                <label
                  className={StyleLabel}
                  htmlFor="owner"
                >
                  Project Owner
                </label>
                <div className="relative">
                  {AuthUser()?.isAdmin  &&
                    <select name="owner"
                            value={formData.owner} 
                            onChange={handleChange}
                            className={StyleTextfield}
                    >
                        {!users && <SingleInputSkeleton />}
                        {users && users.map(user =>
                          <option key={user.id} value={user.username}>{user.full_name} ({user.username})</option>
                        )};
                  
                    </select>
                  }
                  {!AuthUser()?.isAdmin  &&
                    <>
                    <input
                      value = {AuthUser().username}
                      onChange={handleChange}
                      className={StyleTextfield}
                      type="text"
                      placeholder={AuthUser().username} 
                      disabled={true}
                    />
                    <input
                      name="owner"
                      value = {formData.owner}
                      type="hidden"
                    />
                    </>
                  }
                  {errors.owner?.message && <FormErrorMessage message={errors.owner.message as string} />} 
                </div>
              </div>
              
            </div>
          </div>
            <Button 
              type="submit" 
              className="mt-4 w-sm bg-primary"
              disabled = {btnDisabled}
            >
                Save
            </Button>
          </form>
      </div>
  );
}

export default withAuth(ProjectForm);
