// Controlled component version
interface ToggleSwitchProps {
  isOn: boolean;
  onToggle: () => void;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ isOn, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`
        relative w-16 h-6 md:h-8 rounded-full transition-colors duration-300
        ${isOn ? 'bg-blue-900' : 'bg-gray-300'}
      `}
    >
      <div
        className={`
          absolute top-1 left-1 w-4 h-4 md:h-6 md:w-6 bg-white rounded-full 
          transition-transform duration-300
          ${isOn ? 'translate-x-6' : 'translate-x-0'}
        `}
      />
    </button>
  );
};