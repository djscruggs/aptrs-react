import { useState, useEffect, ChangeEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { WithAuth } from "../lib/authutils";
import { currentUserCan, getProjectStatusColor } from "../lib/utilities";
import { FormSkeleton } from '../components/skeletons';
import { getProject, getProjectScopes, getProjectReport, fetchStandards, updateProjectOwner, markProjectAsCompleted, markProjectAsOpen } from '../lib/data/api';
import { Project, Scope } from '../lib/data/definitions';
import 'react-datepicker/dist/react-datepicker.css';
import { ModalErrorMessage, StyleLabel, StyleTextfield, FormErrorMessage, StyleCheckbox } from '../lib/formstyles';
import PageTitle from '../components/page-title';
import UserSelect from '../components/user-select';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import VulnerabilityTable from '../components/vulnerability-table';
import { toast } from 'react-hot-toast';
import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel
} from "@material-tailwind/react";
import ScopeTable from '../components/scope-table';
import { useCurrentUser } from '../lib/customHooks';

interface ProjectViewProps {
  id?: string;
  tab?: string;
}

function ProjectView({ id: externalId }: ProjectViewProps): JSX.Element {
  const navigate = useNavigate();
  const params = useParams();
  const { id: routeId, tab: routeTab } = params;
  const id = externalId || routeId;
  const [selectedTab, setSelectedTab] = useState(routeTab || 'summary');
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<Project | undefined>();
  const [scopes, setScopes] = useState<Scope[]>([]);
  const [loadingError, setLoadingError] = useState(false);
  const [editingOwner, setEditingOwner] = useState(false);
  const [owner, setOwner] = useState('');
  const [ownerError, setOwnerError] = useState('');
  const [saving, setSaving] = useState(false);
  const currentUser = useCurrentUser();

  const handleOwnerChange = (e: ChangeEvent<HTMLInputElement>) => {
    setOwner(e.target.value);
  };

  const cancelEditing = () => {
    setOwnerError('');
    setOwner(project?.owner || '');
    setEditingOwner(false);
  };

  const saveOwner = async () => {
    setSaving(true);
    const _project: Partial<Project> = { id: Number(id), owner: owner || '' };
    try {
      await updateProjectOwner(_project);
      setEditingOwner(false);
      setProject(prev => prev ? { ...prev, owner } : prev);
    } catch (error) {
      setOwnerError("Error saving owner");
      setEditingOwner(true);
    } finally {
      setSaving(false);
    }
  };

  const markAsCompleted = async () => {
    setSaving(true);
    try {
      const response = await markProjectAsCompleted(Number(id));
      console.log(response);
      setProject(prev => prev ? { ...prev, status: 'Completed' } : prev);
    } catch (error) {
      setOwnerError("Error updating project");
    } finally {
      setSaving(false);
    }
  };

  const handleClick = () => {
    navigate(`/projects/${project.id}/edit`);
  };

  const markAsOpen = async () => {
    setSaving(true);
    try {
      const response = await markProjectAsOpen(Number(id));
      console.log(response);
      const { latest_status } = response.data;
      setProject(prev => prev ? { ...prev, status: latest_status  } : prev);
    } catch (error) {
      setOwnerError("Error updating project");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (id) {
        setLoading(true);
        try {
          const projectData = await getProject(id) as Project;
          setProject(projectData);
          setOwner(projectData.owner || '');
          const scopes = await getProjectScopes(id) as Scope[];
          setScopes(scopes);
        } catch (error) {
          console.error("Error fetching project data:", error);
          setLoadingError(true);
        } finally {
          setLoading(false);
        }
      }
    };
    loadData();
  }, [id]);

  useEffect(() => {
    navigate(`/projects/${id}/${selectedTab}`);
  }, [selectedTab]);

  if (loading) return <FormSkeleton numInputs={6} className='max-w-lg' />;
  if (loadingError) return <ModalErrorMessage message={"Error loading project"} />;

  return (
    <>
      {project && (
        <Tabs value={selectedTab}>
          <div className="max-w-screen flex-1 rounded-lg bg-white dark:bg-gray-darkest dark:text-white px-6 pb-4">
            <PageTitle title='Project Details' />
            <TabsHeader className='mt-4'>
              <Tab key="summary" value="summary" onClick={() => setSelectedTab('summary')}>Summary</Tab>
              <Tab key="vulnerabilities" value="vulnerabilities" onClick={() => setSelectedTab('vulnerabilities')}>Vulnerabilities</Tab>
              <Tab key="scopes" value="scopes" onClick={() => setSelectedTab('scopes')}>Scopes</Tab>
              <Tab key="reports" value="reports" onClick={() => setSelectedTab('reports')}>Reports</Tab>
            </TabsHeader>
            <TabsBody>
              <TabPanel value="summary">
                {currentUserCan('Manage Projects') && (
                  <button className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                    onClick={handleClick}>Edit
                    </button>

                )}
                <div className='w-2/3'>
                  <div className="w-full mb-4">
                    <label className={StyleLabel}>Name</label>
                    <div className="relative cursor-text">{project.name}</div>
                  </div>
                  <div className="mt-4">
                    <label className={StyleLabel}>Status</label>
                    <div className={`relative cursor-text ${getProjectStatusColor(project.status)}`}>
                      {project.status}
                      {currentUserCan('Manage Projects') && project.status !== 'Completed' && (
                        <div className='text-secondary underline cursor-pointer text-sm' onClick={markAsCompleted}>Mark Complete</div>
                      )}
                      {currentUserCan('Manage Projects') && project.status == 'Completed' && (
                        <div className='text-secondary underline cursor-pointer text-sm' onClick={markAsOpen}>Reopen</div>
                      )}
                    </div>
                  </div>
                  <div className="w-full mb-4">
                    <label className={StyleLabel}>Project Owner</label>
                    <div className="relative cursor-text">
                      {editingOwner ? (
                        <div className='max-w-[200px]'>
                          <UserSelect
                            name='owner'
                            defaultValue={project.owner}
                            value={owner}
                            changeHandler={handleOwnerChange}
                            required={true}
                          />
                          <div className='flex justify-start my-4'>
                            <button
                              className='bg-primary text-white p-1 rounded-md mr-4 disabled:opacity-50'
                              disabled={saving}
                              onClick={saveOwner}>
                              {saving ? 'Saving...' : 'Save'}
                            </button>
                            {!saving && (
                              <span className='text-secondary underline cursor-pointer' onClick={cancelEditing}>cancel</span>
                            )}
                          </div>
                          {ownerError && <FormErrorMessage message={ownerError} />}
                        </div>
                      ) : (
                        <>
                          {project.owner}
                          {(currentUserCan('Manage Projects') || currentUserCan('Assign Projects')) && (
                            <span className='underline ml-4 cursor-pointer' onClick={() => setEditingOwner(true)}><PencilSquareIcon className="inline w-5" /></span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className={StyleLabel}>Type</label>
                    <div className="relative cursor-text">{project.projecttype}</div>
                  </div>
                  <div className="mt-4">
                    <label className={StyleLabel}>Company</label>
                    <div className="relative cursor-text">{project.companyname}</div>
                  </div>
                  <div className='grid grid-cols-2'>
                    <div className="mt-4">
                      <label className={StyleLabel}>Start Date</label>
                      <div className="relative cursor-text">{project.startdate}</div>
                    </div>
                    <div className="mt-4">
                      <label className={StyleLabel}>End Date</label>
                      <div className="relative cursor-text">{project.enddate}</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className={StyleLabel}>Testing Type</label>
                    <div className="relative cursor-text">{project.testingtype}</div>
                  </div>
                  <div className="mt-4">
                    <label className={StyleLabel}>Project Exception</label>
                    <div dangerouslySetInnerHTML={{ __html: project.projectexception }}></div>
                  </div>
                  <div className="mt-4">
                    <label className={StyleLabel}>Description</label>
                    <div className="relative cursor-text">
                      <div dangerouslySetInnerHTML={{ __html: project.description }}></div>
                    </div>
                  </div>
                </div>
              </TabPanel>
              <TabPanel value="vulnerabilities">
                <VulnerabilityTable projectId={Number(id)} />
              </TabPanel>
              <TabPanel value="scopes">
                <ScopeTable projectId={Number(id)} />
              </TabPanel>
              <TabPanel value="reports">
                <div className="mt-4 max-w-lg">
                  <ReportForm projectId={Number(id)} scopes={scopes} />
                </div>
              </TabPanel>
            </TabsBody>
          </div>
        </Tabs>
      )}
    </>
  );
}

interface ReportFormProps {
  projectId: number;
  scopes: Scope[];
}

function ReportForm({ projectId, scopes }: ReportFormProps) {
  const [error, setError] = useState('');
  const [standards, setStandards] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    projectId,
    Format: '',
    Type: '',
    Standard: [] as string[]
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { Standard } = formData;
    if (Standard.includes(event.target.value)) {
      setFormData({ ...formData, Standard: Standard.filter(item => item !== event.target.value) });
    } else {
      setFormData({ ...formData, Standard: [...Standard, event.target.value] });
    }
  };

  const isValid = () => {
    return formData.Format && formData.Type && formData.Standard.length > 0;
  };

  const loadStandards = async () => {
    const data = await fetchStandards();
    setStandards(data);
  };

  useEffect(() => {
    loadStandards();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await getProjectReport(formData);
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'report';
      if (contentDisposition && contentDisposition.includes('filename=')) {
        filename = contentDisposition.split('filename=')[1].split(';')[0].replace(/"/g, '');
      }
      const contentType = response.headers['content-type'];
      const blob = new Blob([response.data], { type: contentType });
      if (formData.Format === 'pdf') {
        const pdfURL = URL.createObjectURL(blob);
        const newWindow = window.open(pdfURL);
        if (newWindow) {
          newWindow.onload = () => {
            const a = newWindow.document.createElement('a');
            a.href = pdfURL;
            a.download = filename;
            newWindow.document.body.appendChild(a);
            a.click();
            newWindow.document.body.removeChild(a);
          };
        }
      } else {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      toast.success('Report downloaded');
    } catch (error) {
      setError("Error fetching report");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!scopes || scopes.length === 0) {
    return (
      <>
        <FormErrorMessage message="No scopes defined" />
        <p>Please add at least one scope to this project to generate a report.</p>
      </>
    );
  }

  return (
    <>
      {error && <FormErrorMessage message={error} />}
      <label htmlFor='Format'>Format</label>
      <select name='Format' id='Format' className={StyleTextfield} onChange={handleChange}>
        <option value="">Select...</option>
        <option value="pdf">PDF</option>
        <option value="docx">Microsoft Word</option>
        <option value="excel">Microsoft Excel</option>
      </select>
      <label htmlFor='Type'>Type</label>
      <select name='Type' id='Type' className={StyleTextfield} onChange={handleChange}>
        <option value="">Select...</option>
        <option value="Audit">Audit</option>
        <option value="Re-Audit">Re-Audit</option>
      </select>
      <div className='mt-4'>
        {standards.map((standard: any) => (
          <div key={standard.id}>
            <input
              type="checkbox"
              id={`Standard_${standard.id}`}
              name="Standard[]"
              value={standard.name}
              className={StyleCheckbox}
              onChange={handleCheckboxChange}
            />
            <label className='ml-2' htmlFor={`Standard_${standard.id}`}>
              {standard.name}
            </label>
          </div>
        ))}
      </div>
      <button className='bg-primary text-white p-2 rounded-md block mt-6 disabled:opacity-50' disabled={loading || !isValid()} onClick={fetchReport}>Fetch Report</button>
    </>
  );
}

export default WithAuth(ProjectView);