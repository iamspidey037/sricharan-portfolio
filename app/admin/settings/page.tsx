'use client';
// app/admin/settings/page.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Palette, Globe, Mail, Shield, Database, Save, Eye, EyeOff, AlertTriangle, CheckCircle, User, RefreshCw, Download, Upload } from 'lucide-react';

interface Settings {
  siteTitle: string; tagline: string; defaultTheme: 'dark'|'light';
  primaryColor: string; secondaryColor: string; accentColor: string;
  backgroundStyle: string; fontHeading: string; fontBody: string;
  googleAnalyticsId: string; githubUsername: string;
  maintenanceMode: boolean; maintenanceMessage: string;
  metaTitle: string; metaDescription: string; metaKeywords: string;
  contactEmail: string; smtpHost: string; smtpPort: string;
  smtpUser: string; smtpPass: string; autoReplyEnabled: boolean;
}

const DEFAULT: Settings = {
  siteTitle:'Sri Charan | ECE & Embedded AI',tagline:'Building Intelligence at the Edge',
  defaultTheme:'dark',primaryColor:'#00D4FF',secondaryColor:'#00FF88',accentColor:'#FF6B35',
  backgroundStyle:'circuit',fontHeading:'Outfit',fontBody:'DM Sans',
  googleAnalyticsId:'',githubUsername:'sricharan',maintenanceMode:false,
  maintenanceMessage:'Portfolio under maintenance. Coming back soon! 🚀',
  metaTitle:'Sri Charan — ECE Student | Embedded AI & Edge AI Developer',
  metaDescription:'Personal portfolio of Sri Charan, ECE student at KITS Karimnagar.',
  metaKeywords:'Embedded AI, Edge AI, TinyML, ECE, ESP32, STM32',
  contactEmail:'',smtpHost:'smtp.gmail.com',smtpPort:'587',smtpUser:'',smtpPass:'',autoReplyEnabled:true,
};

const TABS = [
  {id:'profile',label:'Profile',icon:User},{id:'theme',label:'Theme',icon:Palette},
  {id:'seo',label:'SEO',icon:Globe},{id:'email',label:'Email',icon:Mail},
  {id:'security',label:'Security',icon:Shield},{id:'backup',label:'Backup',icon:Database},
] as const;

type TabId = typeof TABS[number]['id'];

function Section({title,children}:{title:string;children:React.ReactNode}) {
  return <div className="card p-6 space-y-4"><h3 className="font-heading font-semibold text-text-primary border-b border-border pb-3">{title}</h3>{children}</div>;
}
function Field({label,hint,children}:{label:string;hint?:string;children:React.ReactNode}) {
  return <div><label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>{children}{hint&&<p className="text-xs text-text-muted mt-1">{hint}</p>}</div>;
}

export default function SettingsPage() {
  const [settings,setSettings]=useState<Settings>(DEFAULT);
  const [activeTab,setActiveTab]=useState<TabId>('profile');
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [saved,setSaved]=useState(false);
  const [showSmtpPass,setShowSmtpPass]=useState(false);
  const [pwForm,setPwForm]=useState({current:'',next:'',confirm:''});
  const [pwStatus,setPwStatus]=useState<'idle'|'loading'|'success'|'error'>('idle');
  const [pwError,setPwError]=useState('');

  useEffect(()=>{
    fetch('/api/admin/settings').then(r=>r.json()).then(d=>{if(d.success)setSettings(s=>({...s,...d.data}));}).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  const update=(key:keyof Settings,value:unknown)=>setSettings(s=>({...s,[key]:value}));

  const save=async()=>{
    setSaving(true);
    try{
      const res=await fetch('/api/admin/settings',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(settings)});
      const data=await res.json();
      if(data.success){setSaved(true);setTimeout(()=>setSaved(false),3000);}
    }catch{}finally{setSaving(false);}
  };

  const changePassword=async(e:React.FormEvent)=>{
    e.preventDefault();
    if(pwForm.next!==pwForm.confirm){setPwError('Passwords do not match');return;}
    setPwStatus('loading');setPwError('');
    try{
      const res=await fetch('/api/admin/settings/password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({currentPassword:pwForm.current,newPassword:pwForm.next})});
      const data=await res.json();
      if(!data.success)throw new Error(data.error);
      setPwStatus('success');setPwForm({current:'',next:'',confirm:''});
    }catch(err){setPwStatus('error');setPwError(err instanceof Error?err.message:'Failed');}
  };

  const exportData=async()=>{
    const res=await fetch('/api/admin/settings/export');
    const blob=await res.blob();
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=`portfolio-backup-${Date.now()}.json`;a.click();URL.revokeObjectURL(url);
  };

  if(loading)return <div className="space-y-4">{[...Array(3)].map((_,i)=><div key={i} className="skeleton h-32 rounded-lg"/>)}</div>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-text-primary">Settings</h1>
          <p className="text-text-muted text-sm mt-0.5">Configure your portfolio and admin preferences</p>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary">
          {saving?<span className="w-4 h-4 border-2 border-surface/30 border-t-surface rounded-full animate-spin"/>:saved?<CheckCircle size={15}/>:<Save size={15}/>}
          {saved?'Saved!':saving?'Saving...':'Save Changes'}
        </button>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-border">
        {TABS.map(({id,label,icon:Icon})=>(
          <button key={id} onClick={()=>setActiveTab(id)} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab===id?'border-primary text-primary':'border-transparent text-text-secondary hover:text-text-primary'}`}>
            <Icon size={14}/>{label}
          </button>
        ))}
      </div>

      {activeTab==='profile'&&(
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-4">
          <Section title="Site Identity">
            <Field label="Site Title"><input type="text" value={settings.siteTitle} onChange={e=>update('siteTitle',e.target.value)} className="input-base"/></Field>
            <Field label="Tagline"><input type="text" value={settings.tagline} onChange={e=>update('tagline',e.target.value)} className="input-base"/></Field>
            <Field label="GitHub Username"><input type="text" value={settings.githubUsername} onChange={e=>update('githubUsername',e.target.value)} placeholder="sricharan" className="input-base"/></Field>
            <Field label="Contact Email" hint="Where contact form emails are sent"><input type="email" value={settings.contactEmail} onChange={e=>update('contactEmail',e.target.value)} className="input-base"/></Field>
          </Section>
          <Section title="Maintenance Mode">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={settings.maintenanceMode} onChange={e=>update('maintenanceMode',e.target.checked)} className="accent-primary w-4 h-4"/>
              <span className="text-sm text-text-secondary">Enable maintenance mode</span>
            </label>
            {settings.maintenanceMode&&<Field label="Message"><textarea value={settings.maintenanceMessage} onChange={e=>update('maintenanceMessage',e.target.value)} rows={2} className="input-base resize-none"/></Field>}
          </Section>
        </motion.div>
      )}

      {activeTab==='theme'&&(
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-4">
          <Section title="Color Scheme">
            <div className="grid grid-cols-2 gap-4">
              {[{key:'primaryColor',label:'Primary'},{key:'secondaryColor',label:'Secondary'},{key:'accentColor',label:'Accent'}].map(({key,label})=>(
                <Field key={key} label={label}>
                  <div className="flex gap-2">
                    <input type="color" value={settings[key as keyof Settings] as string} onChange={e=>update(key as keyof Settings,e.target.value)} className="w-10 h-9 rounded border border-border cursor-pointer bg-transparent"/>
                    <input type="text" value={settings[key as keyof Settings] as string} onChange={e=>update(key as keyof Settings,e.target.value)} className="input-base flex-1 font-mono text-sm"/>
                  </div>
                </Field>
              ))}
            </div>
          </Section>
          <Section title="Background Style">
            <div className="grid grid-cols-2 gap-2">
              {[{v:'circuit',l:'🔌 Circuit Board'},{v:'particles',l:'✨ Particles'},{v:'matrix',l:'📟 Matrix'},{v:'solid',l:'⬛ Solid'}].map(bg=>(
                <label key={bg.v} className={`cursor-pointer card p-3 flex items-center gap-2 ${settings.backgroundStyle===bg.v?'border-primary':''}`}>
                  <input type="radio" name="bg" value={bg.v} checked={settings.backgroundStyle===bg.v} onChange={()=>update('backgroundStyle',bg.v)} className="accent-primary"/>
                  <span className="text-sm text-text-secondary">{bg.l}</span>
                </label>
              ))}
            </div>
          </Section>
        </motion.div>
      )}

      {activeTab==='seo'&&(
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-4">
          <Section title="Search Engine Optimization">
            <Field label="Meta Title" hint="60 chars max"><input type="text" value={settings.metaTitle} onChange={e=>update('metaTitle',e.target.value)} className="input-base" maxLength={60}/><p className="text-xs text-text-muted mt-1 text-right">{settings.metaTitle.length}/60</p></Field>
            <Field label="Meta Description" hint="160 chars max"><textarea value={settings.metaDescription} onChange={e=>update('metaDescription',e.target.value)} rows={3} className="input-base resize-none" maxLength={160}/><p className="text-xs text-text-muted mt-1 text-right">{settings.metaDescription.length}/160</p></Field>
            <Field label="Keywords"><input type="text" value={settings.metaKeywords} onChange={e=>update('metaKeywords',e.target.value)} className="input-base"/></Field>
            <Field label="Google Analytics ID"><input type="text" value={settings.googleAnalyticsId} onChange={e=>update('googleAnalyticsId',e.target.value)} placeholder="G-XXXXXXXXXX" className="input-base font-mono"/></Field>
          </Section>
        </motion.div>
      )}

      {activeTab==='email'&&(
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-4">
          <Section title="SMTP Configuration">
            <div className="grid grid-cols-2 gap-4">
              <Field label="SMTP Host"><input type="text" value={settings.smtpHost} onChange={e=>update('smtpHost',e.target.value)} className="input-base"/></Field>
              <Field label="Port"><input type="number" value={settings.smtpPort} onChange={e=>update('smtpPort',e.target.value)} className="input-base"/></Field>
            </div>
            <Field label="SMTP Username"><input type="email" value={settings.smtpUser} onChange={e=>update('smtpUser',e.target.value)} className="input-base"/></Field>
            <Field label="SMTP Password / App Password">
              <div className="relative">
                <input type={showSmtpPass?'text':'password'} value={settings.smtpPass} onChange={e=>update('smtpPass',e.target.value)} className="input-base pr-10" placeholder="App password"/>
                <button type="button" onClick={()=>setShowSmtpPass(!showSmtpPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">{showSmtpPass?<EyeOff size={15}/>:<Eye size={15}/>}</button>
              </div>
            </Field>
            <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={settings.autoReplyEnabled} onChange={e=>update('autoReplyEnabled',e.target.checked)} className="accent-primary w-4 h-4"/><span className="text-sm text-text-secondary">Send auto-reply to visitors</span></label>
          </Section>
        </motion.div>
      )}

      {activeTab==='security'&&(
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-4">
          <Section title="Change Password">
            <form onSubmit={changePassword} className="space-y-3">
              <Field label="Current Password"><input type="password" value={pwForm.current} onChange={e=>setPwForm(f=>({...f,current:e.target.value}))} required className="input-base" autoComplete="current-password"/></Field>
              <Field label="New Password" hint="Min 8 chars, uppercase, lowercase, number, symbol"><input type="password" value={pwForm.next} onChange={e=>setPwForm(f=>({...f,next:e.target.value}))} required className="input-base" autoComplete="new-password"/></Field>
              <Field label="Confirm New Password"><input type="password" value={pwForm.confirm} onChange={e=>setPwForm(f=>({...f,confirm:e.target.value}))} required className={`input-base ${pwForm.confirm&&pwForm.next!==pwForm.confirm?'border-error':''}`} autoComplete="new-password"/></Field>
              {pwStatus==='error'&&<p className="text-error text-sm">{pwError}</p>}
              {pwStatus==='success'&&<p className="text-secondary text-sm flex items-center gap-1"><CheckCircle size={14}/>Password changed!</p>}
              <button type="submit" disabled={pwStatus==='loading'} className="btn-primary"><Shield size={15}/>Change Password</button>
            </form>
          </Section>
        </motion.div>
      )}

      {activeTab==='backup'&&(
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-4">
          <Section title="Export Portfolio Data">
            <p className="text-text-muted text-sm mb-4">Download a complete backup of your portfolio content.</p>
            <button onClick={exportData} className="btn-primary"><Download size={15}/>Export as JSON</button>
          </Section>
          <Section title="⚠️ Danger Zone">
            <p className="text-warning text-sm mb-3">These actions cannot be undone.</p>
            <button onClick={()=>confirm('Delete ALL sections? This cannot be undone.')&&fetch('/api/admin/settings/reset-content',{method:'POST'})} className="btn-secondary border-error/50 text-error text-sm">
              <AlertTriangle size={14}/>Delete All Content
            </button>
          </Section>
        </motion.div>
      )}
    </div>
  );
}
