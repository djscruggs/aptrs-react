import PageTitle from "../components/page-title";
import { FormSkeleton } from "../components/skeletons";
export const Profile = () => {
  return (
    <>
    <PageTitle title='Profile Page' />
    <FormSkeleton numInputs={4} />
    </>
  )
};

export default Profile;