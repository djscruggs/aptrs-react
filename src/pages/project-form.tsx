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
import FilterInput from '../components/filterInput';
import CKWrapper from '../components/ckwrapper';
import CompanySelect from '../components/company-select';
import UserSelect from '../components/user-select';
import { WithAuth } from "../lib/authutils";
import Button from '../components/button';
import { FormSkeleton, SingleInputSkeleton } from '../components/skeletons'
import { getProject } from '../lib/data/api';
import { upsertProject} from '../lib/data/api';
import { Project } from '../lib/data/definitions'

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useCurrentUser } from '../lib/customHooks';

interface FormErrors {
  name?: string
  description?: string
  status?: string
  projecttype?: string
  startdate?: string
  enddate?: string
  testingtype?: string
  projectexception?: string
  companyname?: string
  owner?: string  
}
 
interface ProjectFormProps {
  id?: string; // Make the ID parameter optional
}

function ProjectForm({ id: externalId }: ProjectFormProps): JSX.Element {
  const params = useParams()
  const { id: routeId } = params;
  const id = externalId || routeId; // Use externalId if provided, otherwise use routeId
  const [btnDisabled, setBtnDisabled] = useState(false)
  const [loading, setLoading] = useState(false);
  const [loadingError, setLoadingError] = useState(false);
  const currentUser = useCurrentUser()
  const [editing, setEditing] = useState(false)
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
    owner: currentUser.username,
  });
  const [errors, setErrors] = useState<FormErrors>({});
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
      
    };
    loadData();
  }, [id]);
  const handleCKchange = (name:string, value:string):void => {
    setEditing(true)
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  }
  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };
  
  const handleDatePicker = (input: string, value:string): void => {
    console.log(input, value)
    const formattedDate = new Date(value).toLocaleDateString('en-CA'); // 'en-CA' is the locale for Canada, which uses the 'yyyy-MM-dd' format
    console.log('formattedDate',formattedDate)
    setFormData((prevFormData) => ({
      ...prevFormData,
      [input]: value,
    }));
  }
  const navigate = useNavigate()
  const handleCancel = (event:any) =>  {
    event.preventDefault()
    if(editing){
      if(!confirm('Quit without saving?')){
        return;
      }
    } 
    navigate(-1)
  }
  const handleSubmit = async(event: FormEvent<HTMLFormElement>) => {
    setBtnDisabled(true);
    event.preventDefault();
    const newErrors: FormErrors = {};
    if (formData.name && formData.name.length < 3) {
      newErrors.name = 'Name should be at least three characters';
    }
    //convert dates if necessary
    const formatDate = (value:any) => {
      return new Date(value).toLocaleDateString('en-CA'); // 'en-CA' is the locale for Canada, which uses the 'yyyy-MM-dd' format:any
    }
    if(formData.startdate){
      formData.startdate = formatDate(formData.startdate)
    }
    if(formData.enddate){
      formData.enddate = formatDate(formData.enddate)
    }
    
    
    if (Object.keys(newErrors).length >  0) {
      setErrors(newErrors);
      console.log('Form failed validation:', newErrors);
    } else {
      try {
        console.log('submitting', formData)
        const result = await upsertProject(formData as Project);
        console.log('result',result)
        navigate('/projects')
      } catch (error) {
        console.error('Error submitting form:', error);
        setSaveError(String(error))
      }
    }
    setBtnDisabled(false);
  }
  if(loading) return <FormSkeleton numInputs={5}/>
  if (loadingError) return <ModalErrorMessage message={"Error loading project"} />

  return (
          <div className="flex-1 rounded-lg  px-6 pb-4 pt-8">
          {saveError && <FormErrorMessage message={saveError} />}
          <form action="" onSubmit={handleSubmit} id="projectForm" method="POST">
          <PageTitle title={id ? "Edit Project" : "Create Project"} />
      
          <div className='grid grid-cols-2'>
            <div className="w-full ">
              <div className='flex'>
                <div className="w-1/2 pr-2">
                  <label
                    className={StyleLabel}
                    htmlFor="name"
                  >
                    Name
                  </label>
                  
                  <div className="relative">
                    <input
                      name="name"
                      id="name"
                      value = {formData.name || ''}
                      className={StyleTextfield}
                      onChange={handleChange}
                      type="text"
                      required
                    />
                    {errors.name && <p>{errors.name}</p>} 
                  </div>
              </div>  
              <div className="w-1/2">
                  <label
                    className={StyleLabel}
                    htmlFor="projecttype"
                  >
                    Type
                  </label>
                  <div className="relative">
                    <select name="projecttype"
                        value={formData.projecttype} 
                        onChange={handleChange}
                        className={StyleTextfield}
                        required
                      >
                      <option value=''>Select...</option>
                      {['Web', 'Android','Mobile','Thick Client'].map((type =>
                          <option key={`type-${type}`} value={`${type} Application Penetration Testing`}>{`${type} Application Penetration Testing`}</option>
                    ))}
                    </select>
                    {errors.projecttype && <p>{errors.projecttype}</p>} 
                  </div>
                </div>
              </div>
              <div className='flex mt-4'>
                <div className="w-1/2 pr-2">
                  <label
                    className={StyleLabel}
                    htmlFor="testingtype"
                  >
                    Testing Type
                  </label>
                  <div className="relative">
                    <input
                      name="testingtype"
                      id="testingtype"
                      value = {formData.testingtype || ''}
                      placeholder='Black Box, White Box etc'
                      onChange={handleChange}
                      className={StyleTextfield}
                      type="text"
                      required
                    />
                    {errors.testingtype && <FormErrorMessage message={errors.testingtype} />} 
                  </div>
                </div>
                <div className="w-1/2">
                  <label
                    className={StyleLabel}
                    htmlFor="status"
                  >
                    Status
                  </label>
                  <div className="relative">
                    <select name="status"
                        value={formData.status || ''} 
                        onChange={handleChange}
                        className={StyleTextfield}
                        required
                      >
                      <option value=''>Select...</option>
                      {['Upcoming', 'In Progress','Delay','Completed'].map((status =>
                          <option key={status} value={status}>{status}</option>
                    ))}
                    </select>
                    {errors.status && <p>{errors.status}</p>} 
                  </div>
                </div>
              </div>
              <div className="mt-8 min-h-[200px] w-full">
                <label
                  className={StyleLabel}
                  htmlFor="description"
                >
                  Description
                </label>
              <div className="relative">
                <CKWrapper
                  id="description"
                  data = {formData.description}
                  onChange={handleCKchange}
                />
                  
                {errors.description && <FormErrorMessage message={errors.description} />} 
              </div>
              </div>
            </div>
            <div className="w-full pl-8">
              <div className='flex mb-4'>
                <div className="w-1/2">
                  <label
                    className={StyleLabel}
                    htmlFor="startdate"
                  >
                    Start Date
                  </label>
                  <div className="relative mt-4 border p-1 rounded-md bg-white">
                      <DatePicker
                        id="startdate"
                        name="startdate"
                        placeholderText='Select date'
                        dateFormat="yyyy-MM-dd"
                        onChange={(date:string) => handleDatePicker('startdate', date)}
                        selected={formData.startdate ? new Date(formData.startdate) : ''}
                      />
                    {errors.startdate && <FormErrorMessage message={errors.startdate} />} 
                  </div>
                </div>
                <div className="w-1/2 ml-2 ">
                  <label
                    className={StyleLabel}
                    htmlFor="enddate"
                  >
                    End Date
                  </label>
                  <div className="relative mt-4 border p-1 rounded-md bg-white">
                    <DatePicker
                      id="enddate"
                      name="enddate"
                      placeholderText='Select date'
                      dateFormat="yyyy-MM-dd"
                      onChange={(date:string) => handleDatePicker('enddate', date)}
                      selected={formData.enddate ? new Date(formData.enddate) : ''}
                    />
                    {errors.enddate && <FormErrorMessage message={errors.enddate} />} 
                  </div>
                </div>
              </div>
              <div className='flex'>
                <div className="w-1/2">
                  <label
                    className={StyleLabel}
                    htmlFor="companyname"
                  >
                    Company
                  </label>
                  
                  
                  <div className="relative">
                    
                    {/* only show company select for new objects */}
                    {!formData.id  &&
                      <CompanySelect 
                        name="companyname"
                        id="companyname"
                        value={formData.companyname || ''} 
                        changeHandler={handleChange} 
                        required={true}
                        error={errors.companyname ? true : false}
                      />
                    }
                    {formData.id &&
                      <div className='mt-5'>{formData.companyname}</div>
                    }
                    
                    {errors.companyname && <FormErrorMessage message={errors.companyname} />} 
                  </div>
                </div>
                <div className="w-1/2 pl-2">
                  <label
                    className={StyleLabel}
                    htmlFor="owner"
                  >
                    Project Owner
                  </label>
                  <div className="relative">
                    {currentUser?.isAdmin  &&
                      <UserSelect
                          name='owner'
                          defaultValue={formData.owner}
                          value={formData.owner || ''} 
                          changeHandler={handleChange} 
                          required={true}
                          error={errors.owner ? true : false}
                        />
                    }
                    {errors.owner && <FormErrorMessage message={errors.owner} />} 
                  </div>
                </div>
              </div>
              
              <div className="mt-9">
                <label
                  className={StyleLabel}
                  htmlFor="projectexception"
                >
                  Project Exception
                </label>
                <div className="relative">
                  <CKWrapper
                    id="projectexception"
                    data = {formData.projectexception}
                    onChange={handleCKchange}
                  />
                  
                  {errors.projectexception && <FormErrorMessage message={errors.projectexception} />} 
                </div>
              </div>
              
              
              
            </div>
            
          </div>

          
          <div className="p-2 flex">
            <div className="w-1/2 flex justify-left mt-2">
              <Button 
                type="submit" 
                className="w-sm bg-primary"
                disabled = {btnDisabled}
              >
                  Save
              </Button>
              <Button 
                className="bg-red-500 ml-2"
                onClick = {handleCancel}
                disabled={btnDisabled}>
                  Cancel
              </Button>
            </div>
          </div>
        </form>
      </div>
  );
}

export default WithAuth(ProjectForm);
