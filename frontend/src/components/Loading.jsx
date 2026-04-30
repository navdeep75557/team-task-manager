const Loading = ({ label = "Loading..." }) => {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-md border border-slate-200 bg-white">
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
};

export default Loading;
