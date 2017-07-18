using System;
using System.Collections.Generic;
using System.IO;
using System.Web;
using System.Web.Mvc;

namespace WebApplication1.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";
            ViewBag.MaxFilesCount = 5;
            ViewBag.MaxFileSize = 5;
            return View();
        }

        [HttpPost]
        public ActionResult UploadFiles(HttpPostedFileBase[] files)
        {
            var response = new List<Guid>();
            if(files != null && files.Length > 0)
            {
                foreach (var file in files)
                {
                    var name = Guid.NewGuid();
                    string filePath = name + Path.GetExtension(file.FileName);
                    file.SaveAs(Path.Combine(Server.MapPath("~/UploadedFiles"), filePath));
                    response.Add(name);
                }
            }
            return Json(response);
        }
    }
}