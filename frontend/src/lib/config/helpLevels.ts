import { HelpLevel } from "@/types/chat";

export const helpLevelNames = {
    [HelpLevel.Unrelated]: "Unrelated",
    [HelpLevel.Motivational]: "Motivational",
    [HelpLevel.Feedback]: "Feedback",
    [HelpLevel.GeneralStrategy]: "General Strategy",
    [HelpLevel.ContentStrategy]: "Content Strategy",
    [HelpLevel.Contextual]: "Contextual",
    [HelpLevel.Finished]: "Finished",
};

export const helpLevelColors = {
    [HelpLevel.Unrelated]: "bg-gray-400",
    [HelpLevel.Motivational]: "bg-purple-600",
    [HelpLevel.Feedback]: "bg-blue-600",
    [HelpLevel.GeneralStrategy]: "bg-green-600",
    [HelpLevel.ContentStrategy]: "bg-yellow-600",
    [HelpLevel.Contextual]: "bg-red-600",
    [HelpLevel.Finished]: "bg-gray-800",
};