import { BarLoader } from "react-spinners";

function Loading({loading}) {
    const color = "#334155";
    return (
        <div className="flex items-center justify-center h-screen">
        <BarLoader
        color={color}
        loading={loading}
        size={150}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
      </div>
    )
}

export default Loading;