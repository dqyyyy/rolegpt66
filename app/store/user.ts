import { StoreKey } from "../constant";
import { createPersistStore } from "../utils/store";


export const useUserStore = createPersistStore(
    {
        USER_ID: "",
        USER_PASSWORD:"",
        USER_NAME: ""
    },

    (set, get) => ({
        create(NewUser?: String) {
            const user = get().USER_NAME;
            const id = get().USER_ID;
            set(() => ({ USER_NAME: user, USER_ID: id }));
            // get().markUpdate();

            return user;
        },

        getUser() {
            return get();
        },
        query() {
            const USER = get().USER_NAME
            if (USER == "")
                return { user: "null" };
            else
                return { user: USER };

        },
        update(updater: (data: any) => void ) {
            // const updateName = get().USER_NAME;
            // updateName;
            const data  = get();
            updater(data);
            set(() => ({...data}));
          },
        Logout() {
              // const updateName = get().USER_NAME;
              // updateName;
              set(() => ({ USER_NAME:"", USER_ID:"",USER_PASSWORD:"",}));
            },
        queryAll() {
            
        },
        search(text: string) {
        },
    }),
    {
        name: StoreKey.User,
        version: 3.1,

        // migrate(state, version) {
            
        // },
    },
);
