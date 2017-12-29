# -*- mode: python -*-

block_cipher = None


a = Analysis(['server\\socketio-test.py'],
             pathex=['G:\\all_blue\\flask-socketio-test'],
             binaries=[],
             datas=[],
             hiddenimports=[
                'engineio.async_gevent'
             ],
             hookspath=[],
             runtime_hooks=[],
             excludes=[],
             win_no_prefer_redirects=False,
             win_private_assemblies=False,
             cipher=block_cipher)
pyz = PYZ(a.pure, a.zipped_data,
             cipher=block_cipher)
exe = EXE(pyz,
          a.scripts,
          a.binaries,
          a.zipfiles,
          a.datas,
          name='socketio-test',
          debug=False,
          strip=False,
          upx=True,
          runtime_tmpdir=None,
          console=True )
