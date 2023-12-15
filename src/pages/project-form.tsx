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
import { fetchProject } from '../lib/data/api';
import { upsertProject} from '../lib/data/api';
import { Project } from '../lib/data/definitions'
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import DatePicker from "react-datepicker";
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
    owner: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const loadData = async () => {
      if (id) {
        setLoading(true);
        try {
          const projectData = await fetchProject(id) as Project;
          setFormData(projectData);
        } catch (error) {
          console.error("Error fetching project data:", error);
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
        const response = await upsertProject(formData as Project);
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
  if (loadingError) return <ModalErrorMessage message={"Error loading project"} />


  return (
    <div className="max-w-lg flex-1 rounded-lg">
      
      <h1 className="mb-3 text-2xl">
        {id ? "Edit" : "Create"} Project
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
                          value = {formData.name}
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
                        htmlFor="projecttype"
                      >
                        Type
                      </label>
                      <div className="relative">
                        <input
                          value = {formData.projecttype}
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
                        htmlFor="projecttype"
                      >
                        Company
                      </label>
                      <div className="relative">
                        <input
                          value = {formData.companyname}
                          className={StyleTextfield}
                          type="text"
                          required
                        />
                        {errors.companyname?.message && <FormErrorMessage message={errors.companyname.message as string} />} 
                      </div>
                    </div>
                    {/* <div className='grid grid-cols-2'>
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
                              onChange={(date:Date) => field.onChange(date)}
                              selected={field.value ? new Date(field.value) : null}
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
                            onChange={(date:Date) => field.onChange(date)}
                            selected={field.value ? new Date(field.value) : null}
                          />
                          {errors.enddate?.message && <FormErrorMessage message={errors.enddate.message as string} />} 
                        </div>
                      </div>
                    </div> */}
                    <div className="mt-4">
                      <label
                        className={StyleLabel}
                        htmlFor="testingtype"
                      >
                        Testing Type
                      </label>
                      <div className="relative">
                        <input
                          value = {formData.testingtype}
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
                          value = {formData.projectexception}
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
                        htmlFor="projecttype"
                      >
                        Description
                      </label>
                      <div className="relative">
                        <CKEditor
                          onReady={ editor => {
                                if (formData) {
                                  editor.setData(formData.description)
                                }
                             } }
                          editor={ClassicEditor}                        
                        />
                          
                          {errors.description?.message && <FormErrorMessage message={errors.description.message as string} />} 
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

export default withAuth(ProjectForm);
