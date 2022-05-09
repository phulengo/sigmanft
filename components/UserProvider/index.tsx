import { createContext, useEffect , useState } from "react";
import { useUserData } from "lib/hooks";
import { IUserData } from "lib/interfaces";

export const UserContext = createContext<IUserData>({
	id: "",
	name: "",
	username: "",
	email: "",
	bio: "",
	social_facebook: "",
	social_twitter: "",
	social_website: "",
	avatar_url: "",
	nonce: "",
	joined_at: "",
});

const UserProvider = ({ children }: any) => {
	const userData = useUserData();
	const [user, setUser] = useState<IUserData>(null!);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		setUser(userData as IUserData);
		setLoading(false);
	}, [userData]);

	return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export default UserProvider;
