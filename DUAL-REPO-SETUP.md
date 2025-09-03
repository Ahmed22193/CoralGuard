# Dual Repository Setup

This project is configured to push to two repositories simultaneously:

## Repositories
1. **Primary**: `https://github.com/AbdallahMohamedDotnet/CoralGuard.git`
2. **Secondary**: `https://github.com/Ahmed22193/CoralGuard.git`

## Quick Push Methods

### Method 1: PowerShell Script
```bash
# Run the dual push script
.\dual-push.ps1

# Or with custom commit message
.\dual-push.ps1 -Message "Your commit message here"

# Or using npm script
npm run push:dual
npm run push:both
```

### Method 2: Git Alias
```bash
# Use the custom git alias
git push-both
```

### Method 3: Manual Push
```bash
# Add and commit changes
git add .
git commit -m "Your commit message"

# Push to both repositories
git push origin main
git push ahmed-repo main
```

## Repository Configuration

### Current Remotes
```bash
origin      https://github.com/AbdallahMohamedDotnet/CoralGuard.git
ahmed-repo  https://github.com/Ahmed22193/CoralGuard.git
```

### Check Remote Status
```bash
# View all remotes
git remote -v

# Check branch status
git branch -a

# View last commits on both remotes
git log --oneline --graph --all
```

## Notes
- Both repositories are kept in sync automatically
- All commits and branches are mirrored
- Use any of the methods above for consistent dual pushing
- The PowerShell script provides colored output and error handling
