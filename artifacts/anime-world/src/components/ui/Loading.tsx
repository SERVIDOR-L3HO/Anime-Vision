import { motion } from "framer-motion";

export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative w-16 h-16">
        <motion.div 
          className="absolute inset-0 rounded-full border-t-2 border-primary border-r-2 border-r-transparent opacity-80"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute inset-2 rounded-full border-b-2 border-accent border-l-2 border-l-transparent opacity-80"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
      </div>
      <p className="mt-4 text-primary font-display font-medium tracking-widest uppercase text-sm animate-pulse">
        Loading Sync...
      </p>
    </div>
  );
}

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <span className="text-2xl text-destructive font-bold">!</span>
      </div>
      <h3 className="text-xl font-bold text-white mb-2">Connection Interrupted</h3>
      <p className="text-muted-foreground max-w-md">{message}</p>
    </div>
  );
}
