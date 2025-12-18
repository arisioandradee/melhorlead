# SOLUÇÃO: "Email signups are disabled"

## ❌ ERRO
![Erro](file:///C:/Users/GustavoC/.gemini/antigravity/brain/4beeca0c-589d-4ee8-868e-cdbacc0011a0/uploaded_image_1765381460037.png)

---

## ✅ SOLUÇÃO IMEDIATA

### Passo 1: Acesse o Supabase Dashboard
🔗 https://supabase2.dibaisales.com.br

### Passo 2: Habilite Email Signups
1. No menu lateral esquerdo, clique em **Authentication**
2. Clique em **Providers**
3. Na lista, clique em **Email**
4. Você verá uma página com várias opções

### Passo 3: Ative as Seguintes Opções

**CERTIFIQUE-SE QUE ESTÃO ATIVADAS:**

1. ✅ **Enable Email provider** (deve estar LIGADO/verde)
2. ✅ **Enable Email Signup** (deve estar LIGADO/verde)
3. ❌ **Enable email confirmations** (deve estar DESLIGADO/cinza) ← IMPORTANTE!

### Passo 4: Salvar
- Clique em **Save** no canto inferior direito
- Aguarde a confirmação "Successfully updated"

---

## 🎯 TESTE AGORA

1. Volte para http://localhost:5174/register
2. Tente criar conta novamente
3. **Deve funcionar!**

---

## 📸 COMO DEVE ESTAR

No painel Email Provider, você deve ver:

```
Enable Email provider: ✅ ON
Enable Email Signup: ✅ ON
Enable email confirmations: ❌ OFF
Confirm email: (irrelevante se confirmations está off)
Secure email change: ❌ OFF (opcional)
```

---

## ⚠️ AINDA DÁ ERRO?

Se após fazer isso ainda der erro, me diga qual erro aparece!

Possíveis outros erros:
- "Invalid email" → Use formato válido (xxx@xxx.com)
- "User already exists" → Email já foi usado, use outro
- Outro erro → Me mande screenshot do console (F12)
