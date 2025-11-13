import { Box, Divider, Typography } from "@mui/material";
import { useProfile } from "../../lib/hooks/useProfile";
import { useParams } from "react-router";
import ProfileCard from "./ProfileCard";

type Props = {
    activeTab: number;
}

export default function ProfileFollowings({ activeTab }: Props) {
    const {id} = useParams();
    const predicate = activeTab === 3 ? 'followers' : 'followings';

    const {profile, followings, loadingFollowings} = useProfile(id, predicate)

  return (
    <Box sx={{ mb: 4}}>
        <Box display='flex'>
            <Typography variant="h5">
                {activeTab === 3 
                    ? `People following ${profile?.displayName}` 
                    : `People ${profile?.displayName} is following`}
            </Typography>
        </Box>
        <Divider sx={{
            my: 0
        }} />
        {loadingFollowings ? <Typography>Loading...</Typography> : (
            <Box display='flex' marginTop={3} gap={3}>
                {followings?.map(profile => (
                    <ProfileCard key={profile.id} profile={profile} />
                ))}
            </Box>
        )}
    </Box>
  )
}