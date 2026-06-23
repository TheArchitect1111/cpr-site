import '../../landing.css';
import './portal-login.css';
import { site } from '@/config/site';

export const metadata = {
  title: 'Athlete & Parent Portal Login | CPR',
  robots: { index: false, follow: false },
};

export default async function PortalLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const params = await searchParams;
  return <PortalLoginClient logo={site.brand.logo} reset={Boolean(params.reset)} />;
}

function PortalLoginClient({ logo, reset }: { logo: string; reset: boolean }) {
  return (
    <div className="pl-page">
      <div className="pl-card">
        <div className="pl-logo">
          <img src={logo} alt="CPR" />
          <div className="pl-brand">
            <div className="b1 display">CANADIAN PROSPECTS</div>
            <div className="b2 display">RECRUITMENT</div>
          </div>
        </div>

        <h2>Portal Login</h2>
        <p className="pl-sub">
          Athletes and parents use the same login. Access the Parent Portal, Amplifi™ vision experience, and Update Portal after sign-in.
        </p>

        {reset ? <div className="pl-success">Password updated. Sign in with your new password.</div> : null}
        <div id="pl-error" className="pl-error" style={{ display: 'none' }} aria-live="polite" />

        <div className="pl-field">
          <label htmlFor="pl-username">USERNAME</label>
          <input id="pl-username" type="text" autoComplete="username" autoCapitalize="none" spellCheck={false} placeholder="your-username" />
        </div>

        <div className="pl-field">
          <label htmlFor="pl-password">PASSWORD</label>
          <input id="pl-password" type="password" autoComplete="current-password" placeholder="your password" />
        </div>

        <button id="pl-submit" type="button" className="pl-btn">Log In</button>

        <div className="pl-footer">
          <a href="/portal/forgot-password">Forgot password?</a>
          <span aria-hidden="true"> · </span>
          <a href="/">Back to CPR homepage</a>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
(function(){
  var submit=document.getElementById('pl-submit');
  var errBox=document.getElementById('pl-error');
  function showErr(msg){errBox.textContent=msg;errBox.style.display='block';}
  function hideErr(){errBox.style.display='none';}
  submit.addEventListener('click',function(){
    var username=document.getElementById('pl-username').value.trim();
    var password=document.getElementById('pl-password').value;
    if(!username||!password){showErr('Please enter your username and password.');return;}
    submit.disabled=true;submit.textContent='Logging in...';hideErr();
    fetch('/api/portal/login',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({username:username,password:password})
    }).then(function(r){return r.json().then(function(d){return{ok:r.ok,status:r.status,data:d};});})
    .then(function(res){
      if(res.ok&&res.data.ok){
        window.location.href='/portal/'+res.data.type+'/'+res.data.slug;
      }else{
        showErr(res.data.error||'Invalid username or password.');
        submit.disabled=false;submit.textContent='Log In';
      }
    }).catch(function(){
      showErr('Something went wrong. Please try again.');
      submit.disabled=false;submit.textContent='Log In';
    });
  });
  document.getElementById('pl-password').addEventListener('keydown',function(e){
    if(e.key==='Enter')submit.click();
  });
})();
      `}} />
    </div>
  );
}
