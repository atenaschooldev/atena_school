import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DEFAULT_SCHOOL_PROFILE, type SchoolProfile } from "@atena/api-types";

export function useSchoolProfile() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<SchoolProfile>({
    queryKey: ["school-profile"],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; profile: SchoolProfile }>(
        "/admin/settings/school-profile"
      );
      return res?.profile || DEFAULT_SCHOOL_PROFILE;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updated: Partial<SchoolProfile>) => {
      const res = await api.patch<{ success: boolean; profile: SchoolProfile }>(
        "/admin/settings/school-profile",
        updated
      );
      return res?.profile;
    },
    onSuccess: (newProfile) => {
      if (newProfile) {
        queryClient.setQueryData(["school-profile"], newProfile);
        queryClient.invalidateQueries({ queryKey: ["school-profile"] });
      }
    },
  });

  return {
    profile: data || DEFAULT_SCHOOL_PROFILE,
    isLoading,
    error,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
  };
}
