const GoogleButtonSkeleton = () => {
  return (
    <div className="w-full h-10 rounded-full border border-neutral-200 bg-neutral-100 animate-pulse flex items-center px-4">
      <div className="w-5 h-5 rounded-full bg-neutral-300" />

      <div className="flex-1 flex justify-center">
        <div className="h-3 w-32 rounded bg-neutral-300" />
      </div>
    </div>
  );
};

export default GoogleButtonSkeleton;