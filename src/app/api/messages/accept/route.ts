import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User.model";
import { errorResponse, successResponse } from "@/utils/response";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function POST(request: Request) {
   await dbConnect();

   const session = await getServerSession(authOptions);
   const user: User = session?.user as User;

   if (!session || !session.user) {
      return errorResponse("Not Authenticated", 401);
   }

   const userId = user._id;
   const { acceptMessages } = await request.json();

   try {
      const updatedUser = await UserModel.findByIdAndUpdate(
         userId,
         { isAcceptingMessages: acceptMessages },
         { new: true }
      );

      if (!updatedUser) {
         return errorResponse(
            "failed to update user status to accept messages",
            401
         );
      }
      return successResponse(
         "Message acceptance status updated successfully",
         200
      );
   } catch (error) {
      console.log("failed to update user status to accept messages", error);
      return errorResponse(
         "failed to update user status to accept messages",
         500
      );
   }
}

export async function GET() {
   await dbConnect();

   const session = await getServerSession(authOptions);
   const user: User = session?.user as User;

   if (!session || !session.user) {
      return errorResponse("Not Authenticated", 401);
   }

   const userId = user._id;

   try {
      const foundUser = await UserModel.findById(userId);

      if (!foundUser) {
         return errorResponse("User not found", 401);
      }

      return successResponse({
         message: "User found",
         isAcceptingMessages: foundUser.isAcceptingMessages,
         status: 200,
      });
   } catch (error) {
      console.log("Error in getting message acceptance status", error);
      return errorResponse("Error in getting message acceptance status", 500);
   }
}
