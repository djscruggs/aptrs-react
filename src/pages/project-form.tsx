import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  StyleTextfield,
  StyleLabel,
  FormErrorMessage
} from '../lib/formstyles'
import {Button} from '../components/button'
import { fetchProject } from '../lib/data/api';
import { withAuth } from "../lib/authutils";
import { Controller, useForm } from 'react-hook-form'
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import DatePicker from "react-datepicker";

const schema = z.object({
  name: z.string().min(3, { message: 'Required' }),
  status: z.string().min(5),
  description: z.string().min(5),
  projecttype: z.string().min(5),
  startdate: z.date(),
  enddate: z.date(),
  testingtype: z.string(),
  projectexception: z.string(),
  companyname: z.string(),
  owner: z.string()
});

type ProjectFormData = {
  name: string;
  description: string;
  status: string;
  projecttype: string;
  startdate: string;
  enddate: string;
  testingtype: string;
  projectexception: string;
  companyname: string;
  owner: string;
};

const ProjectForm: React.FC = () => {
  const params = useParams()
  const [data, setData] = useState<ProjectFormData | null>(null)
  var projectData:ProjectFormData;
  const { id } = params;
  const {
    control,
    register,
    formState: { errors },
    setValue, // Function to set form values
  } = useForm<ProjectFormData>({
    resolver: zodResolver(schema), // Your Zod schema
  });
  useEffect(() => {
    const safelySetFormValues = (key: keyof ProjectFormData, value: string | undefined) => {
      if (key in projectData) {
        setValue(key, value || '');
      }
    };
    const loadProject = async (id: string) => {
      try {
        // Fetch project details based on the ID
        projectData = await fetchProject(id) as ProjectFormData;
        for (const [k, v] of Object.entries(projectData)) {
          safelySetFormValues(k as keyof ProjectFormData, v);
        } 
        setData(projectData)       
      } catch (error) {
        console.error("Error")
        console.error(error)
        // Handle error
      }
    };

    if (id) {
      loadProject(id);
    } 
  }, [id, setValue]);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  }
  
    
  const btnDisabled = false;

  
  return (
          
    // "id": 1,
    // "status": "Completed",
    // "name": "Juice Shop",
    // "description": "The project is about Juice Shop application security assessment. The project involves finding security vulnerabilities in the application",
    // "projecttype": "Web Application Penetration Testing",
    // "startdate": "2022-10-26",
    // "enddate": "2022-10-31",
    // "testingtype": "Black Box",
    // "projectexception": "",
    // "companyname": "OWASP",
    // "owner": "admin"
            <div className="max-w-lg flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
                <form action="" onSubmit={handleSubmit} id="projectForm" method="POST">
                  <h1 className="mb-3 text-2xl">
                    {id ? "Edit" : "Create"} Project
                  </h1>
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
                          {...register('name')}
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
                          {...register('projecttype')}
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
                          {...register('companyname')}
                          className={StyleTextfield}
                          type="text"
                          required
                        />
                        {errors.companyname?.message && <FormErrorMessage message={errors.companyname.message as string} />} 
                      </div>
                    </div>
                    <div className='grid grid-cols-2'>
                      <div className="mt-4">
                        <label
                          className={StyleLabel}
                          htmlFor="startdate"
                        >
                          Start Date
                        </label>
                        <div className="relative">
                        <Controller
                          control={control}
                          name='startdate'
                          render={({ field }) => (
                            <DatePicker
                              placeholderText='Select date'
                              dateFormat="yyyy-MM-dd"
                              onChange={(date:Date) => field.onChange(date)}
                              selected={field.value ? new Date(field.value) : null}
                            />
                          )}
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
                        <Controller
                          control={control}
                          name='enddate'
                          render={({ field }) => (
                            <DatePicker
                              placeholderText='Select date'
                              dateFormat="yyyy-MM-dd"
                              onChange={(date:Date) => field.onChange(date)}
                              selected={field.value ? new Date(field.value) : null}
                            />
                          )}
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
                          {...register('testingtype')}
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
                          {...register('projectexception')}
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
                                if (data) {
                                  editor.setData(data.description)
                                }
                             } }
                          editor={ClassicEditor}                        
                        />
                          
                          {errors.description?.message && <FormErrorMessage message={errors.description.message as string} />} 
                      </div>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="mt-4 w-full"
                    disabled = {btnDisabled}
                  >
                      Save
                  </Button>
                </form>
            </div>
  );
}
          



export default withAuth(ProjectForm);