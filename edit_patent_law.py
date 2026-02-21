#!/usr/bin/env python3
"""
Script to remove papers that fail audit tests from patent law chapter.
"""

import re

def main():
    file_path = '/home/saerom/projects/patentworld/src/app/chapters/patent-law/page.tsx'

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Edit 1: Remove Hvide & Jones from Bayh-Dole
    pattern1 = r'''      \{
        citation: 'Hvide, H\. K\., & Jones, B\. F\. \(2018\)\..*?aer\.20160284',
        summary: 'Studying Norway.*?Bayh-Dole–style IP regimes\.',
      \},\n'''
    content = re.sub(pattern1, '', content, flags=re.DOTALL)

    # Edit 2: Remove Helpman from TRIPS
    pattern2 = r'''      \{
        citation: 'Helpman, E\. \(1993\)\..*?2951642',
        summary: 'In a dynamic general equilibrium.*?availability channels\.',
      \},\n'''
    content = re.sub(pattern2, '', content, flags=re.DOTALL)

    # Edit 3: Remove Grossman & Lai from TRIPS
    pattern3 = r'''      \{
        citation: 'Grossman, G\. M\., & Lai, E\. L\.-C\. \(2004\)\..*?0002828043052312',
        summary: 'Non-cooperative equilibria.*?global efficiency\.',
      \},\n'''
    content = re.sub(pattern3, '', content, flags=re.DOTALL)

    # Edit 4: Remove Moser 2005 from TRIPS
    pattern4 = r'''      \{
        citation: 'Moser, P\. \(2005\)\. How do patent laws.*?0002828054825501',
        summary: 'Countries without patent laws.*?overall innovation\.',
      \},\n'''
    content = re.sub(pattern4, '', content, flags=re.DOTALL)

    # Edit 5: Remove Lerner 2002 from State Street
    pattern5 = r'''      \{
        citation: 'Lerner, J\. \(2002\)\. 150 years.*?000282802320189294',
        summary: 'Examining 177 patent policy.*?patent applications\.',
      \},\n'''
    content = re.sub(pattern5, '', content, flags=re.DOTALL)

    # Edit 6: Replace Bilski research array
    pattern6 = r'''    year: 2010,
    title: 'Bilski v\. Kappos',
    category: 'Court',
    description: '.*?',
    research: \[
      \{
        citation: 'Cockburn, I\. M\., & MacGarvie.*?this study\.',
      \},
      \{
        citation: 'Hegde, D\., Ljungqvist.*?eligibility decisions\.',
      \},
    \],'''

    replacement6 = '''    year: 2010,
    title: 'Bilski v. Kappos',
    category: 'Court',
    description: 'The Court held that the "machine-or-transformation" test is not the sole test for patent eligibility under 35 U.S.C. § 101, while narrowing the scope of patentable subject matter for business methods.',
    research: [],'''

    content = re.sub(pattern6, replacement6, content, flags=re.DOTALL)

    # Edit 7: Replace AIA First-to-File research
    pattern7 = r'''    year: 2013,
    title: 'AIA First-Inventor-to-File',
    category: 'Policy',
    description: '.*?',
    research: \[
      \{
        citation: 'Lerner, J\. \(2009\)\..*?research investments\.',
      \},
    \],'''

    replacement7 = '''    year: 2013,
    title: 'AIA First-Inventor-to-File',
    category: 'Policy',
    description: 'The AIA\\'s first-inventor-to-file provision took effect March 16, 2013, fundamentally changing patent priority rules.',
    research: [],'''

    content = re.sub(pattern7, replacement7, content, flags=re.DOTALL)

    # Edit 8: Remove Cockburn & MacGarvie from Alice
    pattern8 = r'''      \{
        citation: 'Cockburn, I\. M\., & MacGarvie, M\. J\. \(2011\)\..*?mnsc\.1110\.1321',
        summary: 'Expanded software patentability had created.*?innovation costs\.',
      \},\n'''
    content = re.sub(pattern8, '', content, flags=re.DOTALL)

    if content != original_content:
        print("Changes detected. Writing to file...")
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("File updated successfully!")
        print(f"Original length: {len(original_content)} characters")
        print(f"New length: {len(content)} characters")
        print(f"Reduction: {len(original_content) - len(content)} characters")
    else:
        print("No changes made - patterns may not have matched.")
        print("This could be due to Unicode character differences.")

if __name__ == '__main__':
    main()
