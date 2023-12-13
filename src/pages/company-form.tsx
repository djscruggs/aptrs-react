import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  StyleTextfield,
  StyleLabel,
  FormErrorMessage
} from '../lib/formstyles'
import Button from '../components/button';
import { fetchCompany, fetchProject } from '../lib/data/api';
import { withAuth } from "../lib/authutils";
import { Controller, useForm } from 'react-hook-form'
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import DatePicker from "react-datepicker";

const schema = z.object({
  name: z.string().min(3, { message: 'Required' }),
  address: z.string().min(10),
});

type CompanyFormData = {
  name: string;
  address: string;
  img: string;
};

const CompanyForm: React.FC = () => {
  const params = useParams()
  var companyData:CompanyFormData;
  const { id } = params;
  const {
    control,
    register,
    formState: { errors },
    setValue, // Function to set form values
  } = useForm<CompanyFormData>({
    resolver: zodResolver(schema), // Your Zod schema
  });
  useEffect(() => {
    const safelySetFormValues = (key: keyof CompanyFormData, value: string | undefined) => {
      if (key in companyData) {
        setValue(key, value || '');
      }
    };
    const loadCompany = async (id: string) => {
      try {
        // Fetch project details based on the ID
        companyData = await fetchCompany(id) as CompanyFormData;
        for (const [k, v] of Object.entries(companyData)) {
          safelySetFormValues(k as keyof CompanyFormData, v);
        }        
      } catch (error) {
        console.error("Error")
        console.error(error)
        // Handle error
      }
    };

    if (id) {
      loadCompany(id);
    } 
  }, [id, setValue]);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  }
  
    
  const btnDisabled = false;

  
  return (
        <div className="max-w-lg flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
            <form action="" onSubmit={handleSubmit} id="projectForm" method="POST">
              <h1 className="mb-3 text-2xl">
                {id ? "Edit" : "Create"} Company
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
                    htmlFor="address"
                  >
                    Address
                  </label>
                  <div className="relative">
                    <input
                      {...register('address')}
                      className={StyleTextfield}
                      type="text"
                      required
                    />
                    {errors.address?.message && <p>{errors.address.message as string}</p>} 
                  </div>
                </div>
                <div className="mt-4">
                  <label
                    className={StyleLabel}
                    htmlFor="img"
                  >
                    Image
                  </label>
                  <div className="relative">
                    <input
                      {...register('img')}
                      className={StyleTextfield}
                      type="text"
                      required
                    />
                    {errors.img?.message && <p>{errors.img.message as string}</p>} 
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
          



export default withAuth(CompanyForm);