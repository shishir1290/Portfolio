const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white p-2 lg:p-4 fixed bottom-0 left-0 w-full z-50">
      <div className="container mx-auto text-center">
        <p className="text-sm lg:text-lg">
          &copy; {new Date().getFullYear()} MD SADMANUR ISLAM SHISHIR. All
          rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
