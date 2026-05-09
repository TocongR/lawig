import Canvas from "./components/Canvas";
import { useObjects } from "./hooks/useObjects";

export default function App() {
  const { objects, addObject } = useObjects();

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <Canvas objects={objects} onAdd={addObject} />
    </div>
  );
}