# Instrucțiuni pentru agenți AI (Cursor)

## Dev server — NU automatiza

**Nu rula `npm run dev`, `npm run start` sau alte comenzi care pornesc/repornesc dev server-ul Astro/Vite**, decât dacă utilizatorul cere explicit în mesajul curent.

Utilizatorul gestionează manual dev server-ul în terminalul lui. Reporniri automate din agent duc la procese zombie pe portul 4321.

### Ce poate face agentul

- Modifică cod, config, componente, CSS etc.
- Rulează `npm run build`, `npm run validate`, teste, lint — fără să pornească dev server.
- Dacă trebuie verificat ceva live, folosește `curl` către `http://127.0.0.1:4321/` **doar dacă utilizatorul confirmă că serverul rulează deja**.

### Ce NU trebuie să facă agentul

- Nu rula `npm run dev` în background după editări.
- Nu rula `npm run stop && npm run dev` automat.
- Nu reporni serverul „ca să verifici” modificările — spune utilizatorului să reîncarce browserul.

### Comenzi pentru utilizator (terminal manual)

```bash
# Oprește tot ce ține portul 4321
npm run stop
# sau forțat:
lsof -ti:4321 | xargs kill -9 2>/dev/null

# Pornește curat (scriptul eliberează automat portul înainte)
npm run dev
```

### Dacă serverul crapă / ERR_CONNECTION_REFUSED

1. `lsof -ti:4321 | xargs kill -9 2>/dev/null`
2. Dacă `node_modules` e corupt: `npm install` sau `npm run repair`
3. O singură instanță: `npm run dev`
