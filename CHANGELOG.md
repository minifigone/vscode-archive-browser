# Change Log

All notable changes to the "archive-browser" extension will be documented in this file.

## 0.3.2 2021-05-11

- Updating dependency versions
- Update readme

## 0.3.1 2020-07-29

- Updating readme with forgotten things from 0.3.0

## 0.3.0 2020-07-29

- Added extraction for 7ZIP (.7z)
- Added decompression for LZMA (.lzma)
- Added icon

## 0.2.0 2020-07-22

- Added decompression for BZIP2
  - Includes BZIP2 decompression for ZIP-like archives
  - Includes BZIP2 decompression for tarballs (.tar.bz2)
- Completed file information page

## 0.1.0 2020-07-15

Initial (pre-)release!

- Added extraction for the following archive files
  - ZIP (.zip)
  - TAR (.tar)
  - JAR (.jar)
  - AAR (.aar)
- Added decompression for the following compression types
  - GZIP (.gz)
- Added saving extracted files to an OS-based temporary directory
- Added connecting extracted files to the VS Code workspace
- Added handling of multi-type archives (e.g. .tar.gz)
- Added uncompressed file information page
