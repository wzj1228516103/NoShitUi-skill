import { ThemeProvider, createTheme, Button, CssBaseline } from '@mui/material';
import { Plus } from 'lucide-react';
const theme = createTheme({ palette: { primary: { main: '#2f5f50' } }, shape: { borderRadius: 6 } });
export default function App() { return <ThemeProvider theme={theme}><CssBaseline /><main><h1>Orders</h1><Button startIcon={<Plus size={16} />}>New order</Button></main></ThemeProvider>; }
