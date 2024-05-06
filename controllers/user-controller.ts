import 'dotenv/config';
import { createClient } from '@supabase/supabase-js'


export const supabaseClient = async () => {
  try {
  const supabaseUrl = process.env.SUPABASE_URL || ''
  const supabaseKey =  process.env.SUPABASE_KEY || ''
  return createClient(supabaseUrl, supabaseKey)
  } catch (e: any) {
    console.log(e)
  }
}



export const login = async (req: any, res: any) => {
  const { email, password } = req.body;
  const supabase = await supabaseClient()
  try {
    // @ts-ignore
    const { data, error } = await supabase.auth.signInWithPassword({
      email : email,
      password: password,
    });
    return res.status(200).json(data);
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
};

export const signup = async (req: any, res: any) => {
  const { email, password } = req.body;
  const supabase = await supabaseClient()
  try {
    // @ts-ignore
    const { data, error } = await supabase.auth.signUp({
      email : email,
      password: password,
    });
    return res.status(200).json(data);
  } catch (e: any) {
    console.log(e);
    return res.status(400).json({ error: e.message });
  }
};

export const logout = async (req: any, res: any) => {
  try {
    const supabase = await supabaseClient()
    // @ts-ignore
    await supabase.auth.signOut();
    return res.status(200).json({ message: 'Logged out' });
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
};

export default { signup, login, logout };
