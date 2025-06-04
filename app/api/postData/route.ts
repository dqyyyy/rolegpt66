
import { type NextApiRequest, type NextApiResponse } from "next";
// import { NextResponse } from "next/server";
import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile, readFileSync, open,close, existsSync } from "fs"
import path from "path";


const dataPath = "Userdata/user.json"

const userDBGet = () => {
  // let JsonData = {};
  // readFile(dataPath, async (error, data) => {
  //   if (error) {
  //     console.log(error);
  //     return;
  //   }
  //   JsonData = JSON.parse(data);

  // });
  let JsonData:string | {}= readFileSync(dataPath).toString();
  try {
    JsonData = JSON.parse(JsonData as string);
  }
  catch (err) {
    JsonData = {};
  }
  return JsonData;
};

const handle = async (req: NextRequest) => {
  // 创建上下文和调用者
  try {

    const body = await req.json();


    if (body.type == "login") {
      // console.log("[login Data]  ", body);
      const userDB = userDBGet();
      const username = Object.values(userDB).map(user => (user?.UserName || ""));
      // console.log("[userDB] ", userDB["id1"]);
      const USER_ID = Object.keys(userDB)[username.indexOf(body.UserName)]
      if (username.indexOf(body.UserName) == -1)
        return NextResponse.json({ err: "没有此用户" }, { status: 400 });
      // return NextResponse.json({ body: JSON.stringify({user:"OKs"}) }, { status: 200 });
      else {
        const { UserPassWord, ...JsonUser } = userDB[USER_ID];
        // console.log("[UserPassWord ]", UserPassWord, body.UserPassWord, body.UserPassWord === UserPassWord);
        if (body.UserPassWord !== UserPassWord) {
          return NextResponse.json({ err: "密码错误" }, { status: 400 });
        }
        else
          return NextResponse.json({
            USER_ID: USER_ID,
            ...JsonUser
          }, { status: 200 });
      }

    }

    if (body.type == "register") {

      console.log("[register Data]  ", body);
      const userDB = userDBGet();
      const username = Object.values(userDB).map(user => (user.UserName || ""));
      // console.log("[userDB] ",userDB[body.UserName]);
      const userIndex = username.indexOf(body.UserName);
      // console.log("[username ]", Object.values(userDB));
      // console.log("[userIndex ]", userIndex);
      // console.log("[body.UserName ]", body.UserName);
      if (username.indexOf(body.UserName) != -1)
        return NextResponse.json({ err: "用户名被占用" }, { status: 400 });
      // return NextResponse.json({ body: JSON.stringify({user:"OKs"}) }, { status: 200 });
      else {
        // readFile(dataPath, (error, data) => {
        //   if (error) {
        //     console.log(error);
        //     return;
        //   }
        //   const parsedData = JSON.parse(data);
        //   console.log("[parsedData] ", parsedData);
        //   const { type, ...userData } = body
        //   parsedData[`id${Object.keys(parsedData).length+1}`] = {
        //     ...userData,
        //     "MessagesNumber": 0

        //   };
        //   writeFile(dataPath, JSON.stringify(parsedData, null, 2), (err) => {
        //     if (err) {
        //       console.log('Failed to write updated data to file');
        //       return;
        //     }
        //     console.log('Updated file successfully');
        //   });
        // });


        const parsedData = userDB;
        // console.log("[parsedData] ", parsedData);
        const { type, ...userData } = body
        const newId = `id${Object.keys(parsedData).length + 1}`
        parsedData[newId] = {
          ...userData,

        };
        writeFile(dataPath, JSON.stringify(parsedData, null, 2), (err) => {
          if (err) {
            // console.log('Failed to write updated data to file');
            return;
          }
          // console.log('Updated file successfully');
        });



        // const USER_ID = Object.keys(userDB)[username.indexOf(body.UserName)]
        // console.log("[USER_ID] ", Object.keys(userDB), USER_ID);

        return NextResponse.json({
          USER_ID: newId,
          ...parsedData[newId]
        }, { status: 200 });
      }



    }
    if (body.type == "history") {

      let data = "";
      // console.log("[history Data]  ", body);
      if (!body.USER_ID)

        return NextResponse.json({ err: "请登录使用" }, { status: 400 });
      const path = "Userdata/UserMessages/" + body.USER_ID + ".json"
      if (existsSync(path)) {
        data = readFileSync(path).toString();

      }
      
      let parsedData: Object;

      if (data === "") {
        parsedData = {
          UserName: body.USER_NAME,
          MessagesNumber: 1,
          data: {
            "Messages_1": {
              "MessagesName": body.title,
              "MessagesUpdateDate": Date.now(),
              "MessagesData": body.data
            }

          }
        }
      }
      else {

        parsedData = JSON.parse(data)
        // console.log("[filedata] ", parsedData.data[`Messages_${parsedData.MessagesNumber}`].MessagesData);
        const DataIndex = Object.values(parsedData.data).map(data => data.MessagesName).indexOf(body.title);
        parsedData.MessagesNumber = DataIndex === -1 ? parsedData.MessagesNumber + 1 :parsedData.MessagesNumber;
        const MessagesNumber = DataIndex === -1 ? parsedData.MessagesNumber  : DataIndex+1
        // console.log("[DataIndex,MessagesNumber] ",DataIndex, MessagesNumber);
        // if(DataIndex === -1){
        //   parsedData.MessagesNumber = parsedData.MessagesNumber + 1;
        //   parsedData.data[`Messages_${parsedData.MessagesNumber}`].MessagesData
        // }
        // else {

        // }
        const updateData = {
          "MessagesName": body.title,
          "MessagesUpdateDate": Date.now(),
          "MessagesData": parsedData.data[`Messages_${MessagesNumber}`]?.MessagesData || []

        }
        parsedData.data = {
          ...parsedData.data,
          [`Messages_${MessagesNumber}`]: updateData
        }
        parsedData.data[`Messages_${MessagesNumber}`].MessagesData
            .push(...body.data.filter((MessagesData) => {
              return (parsedData.data[`Messages_${MessagesNumber}`].MessagesData).map(data=>data.id).indexOf(MessagesData.id) === -1
            }))
        // console.log("[body.data.filter ]", body.data.filter((MessagesData) => {
        //   return (parsedData.data[`Messages_${MessagesNumber}`].MessagesData).map(data=>data.id).indexOf(MessagesData.id) === -1
        // }));
      };
      // console.log("[data.toString() ]", data);

      const { type, ...userData } = body;
      writeFile(path, JSON.stringify(parsedData, null, 2), (err) => {
        if (err) {
          console.log('Failed to write updated data to file');
          return;
        }
        // console.log('Updated file successfully');
      });


      return NextResponse.json({ body: "OK1" }, { status: 200 });
    }


  } catch (cause) {
    // 另一个错误在此发生
    console.error(cause);
    return NextResponse.json(
      {
        error: true,
        msg: "Internal server error",
      },
      {
        status: 403,
      },
    );
  }
};

// export default userHandler;

export const GET = handle;
export const POST = handle;