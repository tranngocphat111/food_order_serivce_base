import { verifyTokenAPI } from "@/services/api";
import { createContext, useContext, useEffect, useState } from "react";
import PacmanLoader from "react-spinners/PacmanLoader";

interface IAppContext {
    isAuthenticated: boolean;
    setIsAuthenticated: (v: boolean) => void;
    setUser: (v: IUser | null) => void;
    user: IUser | null;
    isAppLoading: boolean;
    setIsAppLoading: (v: boolean) => void;

    carts: ICart[];
    setCarts: (v: ICart[]) => void;
}

const CurrentAppContext = createContext<IAppContext | null>(null);

type TProps = {
    children: React.ReactNode
}

export const AppProvider = (props: TProps) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<IUser | null>(null);
    const [isAppLoading, setIsAppLoading] = useState<boolean>(true);
    const [carts, setCarts] = useState<ICart[]>([])

    useEffect(() => {
        const fetchAccount = async () => {
            const token = localStorage.getItem('access_token');
            const userStr = localStorage.getItem('user');
            const cartsStr = localStorage.getItem("carts");

            if (token && userStr) {
                try {
                    const savedUser = JSON.parse(userStr) as IUser;
                    const verifyResult = await verifyTokenAPI(token) as ITokenVerifyResponse;

                    if (verifyResult?.valid) {
                        setUser({
                            ...savedUser,
                            id: verifyResult.userId ?? savedUser.id,
                            username: verifyResult.username ?? savedUser.username,
                            email: verifyResult.email ?? savedUser.email,
                            role: verifyResult.role ?? savedUser.role ?? 'USER'
                        });
                        setIsAuthenticated(true);

                        if (cartsStr) {
                            setCarts(JSON.parse(cartsStr));
                        }
                    } else {
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('user');
                        localStorage.removeItem('carts');
                    }
                } catch (error) {
                    const savedUser = JSON.parse(userStr);
                    setUser(savedUser);
                    setIsAuthenticated(true);
                    
                    if (cartsStr) {
                        setCarts(JSON.parse(cartsStr));
                    }
                }
            }
            setIsAppLoading(false);
        }

        fetchAccount();
    }, [])

    return (
        <>
            {isAppLoading === false ?
                <CurrentAppContext.Provider value={{
                    isAuthenticated, user, setIsAuthenticated, setUser,
                    isAppLoading, setIsAppLoading,
                    carts, setCarts
                }}>
                    {props.children}
                </CurrentAppContext.Provider>
                :
                <div style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)"
                }}>
                    <PacmanLoader
                        size={30}
                        color="#36d6b4"
                    />
                </div>
            }

        </>

    );
};

export const useCurrentApp = () => {
    const currentAppContext = useContext(CurrentAppContext);

    if (!currentAppContext) {
        throw new Error(
            "useCurrentApp has to be used within <CurrentAppContext.Provider>"
        );
    }

    return currentAppContext;
};

