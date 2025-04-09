import { ProblemEditor } from "@/components/problem-editor";

export default function IDEPage() {
  return (
    <>
      <div className="font-jetbrains-mono flex flex-col h-screen w-screen overflow-hidden">
        <h1> IDE </h1>
        <div className="w-full h-full font-jetbrains-mono">
          <ProblemEditor />
        </div>
      </div>
    </>
  );
}
