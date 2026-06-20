import { TextField, InputAdornment } from '@mui/material';
import { useSelector } from 'react-redux';
import { Search } from 'lucide-react';
import { selectDirection } from '../../store/directionSlice';

export default function SearchInput({ value, onChange, placeholder = 'Search...', ...props }) {
  const dir = useSelector(selectDirection);
  return (
    <TextField
      size="small"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      slotProps={{
        input: {
          [dir === 'rtl' ? 'endAdornment' : 'startAdornment']: (
            <InputAdornment position={dir === 'rtl' ? 'end' : 'start'}>
              <Search size={18} style={{ opacity: 0.5 }} />
            </InputAdornment>
          ),
        },
      }}
      sx={{
        minWidth: 280,
        '& .MuiOutlinedInput-root': { bgcolor: 'background.default' },
      }}
      {...props}
    />
  );
}
